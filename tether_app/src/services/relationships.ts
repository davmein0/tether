import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Invite, InviteRecord, Relationship, RelationshipRecord, UserRole } from "../types";

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
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

export async function getRelationshipForUser(
  userId: string,
  userRole: UserRole,
): Promise<RelationshipRecord | null> {
  const relationshipQuery = query(
    collection(db, "relationships"),
    where(userRole === "doer" ? "doerId" : "supporterId", "==", userId),
    limit(1),
  );

  const snapshot = await getDocs(relationshipQuery);

  if (snapshot.empty) {
    return null;
  }

  const relationshipDoc = snapshot.docs[0];
  return toRelationshipRecord(
    relationshipDoc.id,
    relationshipDoc.data() as Relationship,
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
  return toInviteRecord(inviteDoc.id, inviteDoc.data() as Invite);
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

  const relationshipRef = await addDoc(
    collection(db, "relationships"),
    relationshipPayload,
  );

  const invitePayload: Invite = {
    relationshipId: relationshipRef.id,
    createdBy: userId,
    createdByRole: userRole,
    targetRole: userRole === "doer" ? "supporter" : "doer",
    code: createInviteCode(),
    status: "pending",
    claimedBy: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const inviteRef = await addDoc(collection(db, "invites"), invitePayload);

  return {
    invite: toInviteRecord(inviteRef.id, invitePayload),
    relationship: toRelationshipRecord(relationshipRef.id, relationshipPayload),
  };
}

export async function acceptInvite(
  userId: string,
  userRole: UserRole,
  code: string,
): Promise<RelationshipRecord> {
  const inviteQuery = query(
    collection(db, "invites"),
    where("code", "==", code),
    where("status", "==", "pending"),
    limit(1),
  );

  const inviteSnapshot = await getDocs(inviteQuery);

  if (inviteSnapshot.empty) {
    throw new Error("No pending invite matches that code.");
  }

  const inviteDoc = inviteSnapshot.docs[0];
  const invite = inviteDoc.data() as Invite;

  if (invite.createdBy === userId) {
    throw new Error("Use a different account to accept your own invite.");
  }

  if (invite.targetRole !== userRole) {
    throw new Error(`This invite expects a ${invite.targetRole}.`);
  }

  const relationshipRef = doc(db, "relationships", invite.relationshipId);
  const relationshipSnapshot = await getDoc(relationshipRef);

  if (!relationshipSnapshot.exists()) {
    throw new Error("The relationship for this invite no longer exists.");
  }

  const relationship = relationshipSnapshot.data() as Relationship;

  if (userRole === "doer" && relationship.doerId) {
    throw new Error("This doer slot has already been claimed.");
  }

  if (userRole === "supporter" && relationship.supporterId) {
    throw new Error("This supporter slot has already been claimed.");
  }

  const nextDoerId = userRole === "doer" ? userId : relationship.doerId;
  const nextSupporterId =
    userRole === "supporter" ? userId : relationship.supporterId;

  await updateDoc(relationshipRef, {
    doerId: nextDoerId,
    supporterId: nextSupporterId,
    status: "active",
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "invites", inviteDoc.id), {
    status: "accepted",
    claimedBy: userId,
    updatedAt: serverTimestamp(),
  });

  return toRelationshipRecord(invite.relationshipId, {
    ...relationship,
    doerId: nextDoerId,
    supporterId: nextSupporterId,
    status: "active",
    updatedAt: serverTimestamp(),
  });
}
