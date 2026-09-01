import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Invite,
  InviteRecord,
  Relationship,
  RelationshipRecord,
  UserRole,
} from "../types";

/** Omits I, O, 0 and 1 so a code read aloud or over text is unambiguous. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function createInviteCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

/**
 * The code is the invite's document ID. That lets the security rules allow a
 * direct `get` by code (the code is the secret) while forbidding listing the
 * collection, so an invite code cannot be discovered by enumeration.
 */
async function createUnusedInviteCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createInviteCode();
    const existing = await getDoc(doc(db, "invites", code));
    if (!existing.exists()) return code;
  }
  throw new Error("Could not generate an unused invite code. Please try again.");
}

function toRelationshipRecord(
  id: string,
  relationship: Relationship,
): RelationshipRecord {
  return { id, ...relationship };
}

function toInviteRecord(id: string, invite: Invite): InviteRecord {
  return { id, ...invite };
}

function relationshipQueryForUser(userId: string, userRole: UserRole) {
  return query(
    collection(db, "relationships"),
    where(userRole === "doer" ? "doerId" : "supporterId", "==", userId),
    limit(1),
  );
}

export async function getRelationshipForUser(
  userId: string,
  userRole: UserRole,
): Promise<RelationshipRecord | null> {
  const snapshot = await getDocs(relationshipQueryForUser(userId, userRole));

  if (snapshot.empty) {
    return null;
  }

  const relationshipDoc = snapshot.docs[0];
  return toRelationshipRecord(
    relationshipDoc.id,
    relationshipDoc.data() as Relationship,
  );
}

/**
 * Watches the caller's relationship so the pending-invite screen flips to the
 * dashboard as soon as the other person accepts, without a page reload.
 */
export function subscribeToRelationshipForUser(
  userId: string,
  userRole: UserRole,
  onChange: (relationship: RelationshipRecord | null) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    relationshipQueryForUser(userId, userRole),
    (snapshot) => {
      if (snapshot.empty) {
        onChange(null);
        return;
      }
      const relationshipDoc = snapshot.docs[0];
      onChange(
        toRelationshipRecord(
          relationshipDoc.id,
          relationshipDoc.data() as Relationship,
        ),
      );
    },
    onError,
  );
}

export async function getPendingInviteForUser(
  userId: string,
): Promise<InviteRecord | null> {
  const inviteQuery = query(
    collection(db, "invites"),
    where("createdBy", "==", userId),
    where("status", "==", "pending"),
    limit(1),
  );

  const snapshot = await getDocs(inviteQuery);

  if (snapshot.empty) {
    return null;
  }

  const inviteDoc = snapshot.docs[0];
  const invite = inviteDoc.data() as Invite;

  if (invite.expiresAt && invite.expiresAt.toMillis() < Date.now()) {
    return null;
  }

  return toInviteRecord(inviteDoc.id, invite);
}

export async function createInviteForUser(userId: string, userRole: UserRole) {
  const existingRelationship = await getRelationshipForUser(userId, userRole);

  if (existingRelationship) {
    throw new Error("You are already connected to a relationship.");
  }

  const relationshipPayload: Relationship = {
    name: userRole === "doer" ? "Doer + supporter" : "Supporter + doer",
    doerId: userRole === "doer" ? userId : null,
    supporterId: userRole === "supporter" ? userId : null,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const invitePayload: Invite = {
    relationshipId: "",
    createdBy: userId,
    createdByRole: userRole,
    targetRole: userRole === "doer" ? "supporter" : "doer",
    code: await createUnusedInviteCode(),
    status: "pending",
    claimedBy: null,
    expiresAt: Timestamp.fromMillis(Date.now() + INVITE_TTL_MS),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // One batch, so a failure can't leave a pending relationship with no invite
  // pointing at it — which would permanently block this user from retrying.
  const relationshipRef = doc(collection(db, "relationships"));
  const inviteRef = doc(db, "invites", invitePayload.code);
  invitePayload.relationshipId = relationshipRef.id;

  const batch = writeBatch(db);
  batch.set(relationshipRef, relationshipPayload);
  batch.set(inviteRef, invitePayload);
  await batch.commit();

  return {
    invite: toInviteRecord(inviteRef.id, invitePayload),
    relationship: toRelationshipRecord(relationshipRef.id, relationshipPayload),
  };
}

/**
 * Removes the invite and the half-formed relationship together; leaving the
 * relationship behind would make `getRelationshipForUser` report the creator as
 * already connected and block them from inviting anyone else.
 */
export async function cancelInvite(code: string, relationshipId: string) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "invites", code));
  batch.delete(doc(db, "relationships", relationshipId));
  await batch.commit();
}

export async function acceptInvite(
  userId: string,
  userRole: UserRole,
  code: string,
): Promise<RelationshipRecord> {
  const inviteRef = doc(db, "invites", code.trim().toUpperCase());

  // Re-read both documents inside the transaction: two people racing on the
  // same code would otherwise both pass the "slot is free" check below.
  return runTransaction(db, async (transaction) => {
    const inviteDoc = await transaction.get(inviteRef);

    if (!inviteDoc.exists()) {
      throw new Error("No pending invite matches that code.");
    }

    const invite = inviteDoc.data() as Invite;

    if (invite.status !== "pending") {
      throw new Error("That invite has already been used.");
    }

    if (invite.expiresAt && invite.expiresAt.toMillis() < Date.now()) {
      throw new Error("That invite has expired. Ask for a new code.");
    }

    if (invite.createdBy === userId) {
      throw new Error("Use a different account to accept your own invite.");
    }

    if (invite.targetRole !== userRole) {
      throw new Error(`This invite expects a ${invite.targetRole}.`);
    }

    const relationshipRef = doc(db, "relationships", invite.relationshipId);
    const relationshipDoc = await transaction.get(relationshipRef);

    if (!relationshipDoc.exists()) {
      throw new Error("The relationship for this invite no longer exists.");
    }

    const relationship = relationshipDoc.data() as Relationship;

    if (userRole === "doer" && relationship.doerId) {
      throw new Error("This doer slot has already been claimed.");
    }

    if (userRole === "supporter" && relationship.supporterId) {
      throw new Error("This supporter slot has already been claimed.");
    }

    const nextDoerId = userRole === "doer" ? userId : relationship.doerId;
    const nextSupporterId =
      userRole === "supporter" ? userId : relationship.supporterId;

    transaction.update(relationshipRef, {
      doerId: nextDoerId,
      supporterId: nextSupporterId,
      status: "active",
      updatedAt: serverTimestamp(),
    });

    transaction.update(inviteRef, {
      status: "accepted",
      claimedBy: userId,
      updatedAt: serverTimestamp(),
    });

    return toRelationshipRecord(invite.relationshipId, {
      ...relationship,
      doerId: nextDoerId,
      supporterId: nextSupporterId,
      status: "active",
    });
  });
}
