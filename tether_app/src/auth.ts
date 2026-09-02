import { signInWithPopup } from "firebase/auth";
import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./services/firebase";
import type { AppUser, UserRole } from "./types";

const ROLES: UserRole[] = ["doer", "supporter"];

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && ROLES.includes(value as UserRole);
}

/** Throws on failure so callers can tell the user; a cancelled popup is not an error. */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      return null;
    }
    throw error;
  }
}

/** Returns null when the stored profile has no usable role, so the app re-asks. */
export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  if (!isUserRole(data.role)) {
    return null;
  }

  return { ...data, role: data.role } as AppUser;
}

export async function saveUserProfile(user: User, role: UserRole): Promise<AppUser> {
  const userProfile: AppUser = {
    displayName: user.displayName ?? "",
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", user.uid), userProfile, { merge: true });

  return userProfile;
}
