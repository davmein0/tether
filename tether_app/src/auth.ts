import { signInWithPopup } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, googleProvider } from "./services/firebase";

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    return null;
  }
};
