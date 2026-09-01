import { Timestamp } from "firebase/firestore";

/**
 * Firestore `createdAt` fields are `unknown` on our models because a document
 * read back from a listener holds a `Timestamp`, while a document that was just
 * written locally still holds the unresolved `serverTimestamp()` sentinel.
 */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as Timestamp).toDate();
  }
  return null;
}

export function toMillis(value: unknown): number {
  return toDate(value)?.getTime() ?? 0;
}
