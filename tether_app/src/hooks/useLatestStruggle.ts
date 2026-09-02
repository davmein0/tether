import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useFirestoreQuery } from "./useFirestoreQuery";
import type { Event } from "../types";

export default function useLatestStruggle(relationshipId: string) {
  const { items, loading, error } = useFirestoreQuery<Event>(
    () =>
      query(
        collection(db, "events"),
        where("relationshipId", "==", relationshipId),
        where("type", "==", "struggle"),
        orderBy("createdAt", "desc"),
        limit(1),
      ),
    [relationshipId],
  );

  return { event: items[0] ?? null, loading, error };
}
