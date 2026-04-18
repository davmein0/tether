import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import type { Event } from "../types";

export default function useLatestStruggle(relationshipId: string) {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "events"),
      where("relationshipId", "==", relationshipId),
      where("type", "==", "struggle"),
      orderBy("createdAt", "desc"),
      limit(1),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setEvent(snapshot.docs[0].data() as Event);
      }
    });

    return unsub;
  }, [relationshipId]);

  return event;
}
