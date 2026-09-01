import { collection, orderBy, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useFirestoreQuery } from "./useFirestoreQuery";
import type { Goal } from "../types";

export default function useGoals(relationshipId: string) {
  return useFirestoreQuery<Goal>(
    () =>
      query(
        collection(db, "goals"),
        where("relationshipId", "==", relationshipId),
        orderBy("createdAt", "desc"),
      ),
    [relationshipId],
  );
}
