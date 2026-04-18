import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { Goal } from "../types";

export default function useGoals(relationshipId: string) {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const goalsQuery = query(
      collection(db, "goals"),
      where("relationshipId", "==", relationshipId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      goalsQuery,
      (snapshot) => {
        setGoals(snapshot.docs.map((doc) => doc.data() as Goal));
      },
      (error) => {
        console.error("goals listener error:", error);
      },
    );

    return unsubscribe;
  }, [relationshipId]);

  return goals;
}
