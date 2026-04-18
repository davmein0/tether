import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { TimelineEntry } from "../types";

export default function useTimelineEntries(relationshipId: string) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    const timelineQuery = query(
      collection(db, "timelineEntries"),
      where("relationshipId", "==", relationshipId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      timelineQuery,
      (snapshot) => {
        setEntries(snapshot.docs.map((doc) => doc.data() as TimelineEntry));
      },
      (error) => {
        console.error("timelineEntries listener error:", error);
      },
    );

    return unsubscribe;
  }, [relationshipId]);

  return entries;
}
