import { collection, orderBy, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useFirestoreQuery } from "./useFirestoreQuery";
import type { TimelineEntry } from "../types";

export default function useTimelineEntries(relationshipId: string) {
  return useFirestoreQuery<TimelineEntry>(
    () =>
      query(
        collection(db, "timelineEntries"),
        where("relationshipId", "==", relationshipId),
        orderBy("createdAt", "desc"),
      ),
    [relationshipId],
  );
}
