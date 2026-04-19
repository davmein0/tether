import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

type Props = {
  relationshipId: string;
  onTrigger?: () => void;
};

export default function StruggleButton({ relationshipId, onTrigger }: Props) {
  const handleClick = async () => {
    await addDoc(collection(db, "events"), {
      relationshipId,
      type: "struggle",
      mood: "stress",
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, "timelineEntries"), {
      relationshipId,
      type: "reachout",
      title: "Reached out for support",
      detail:
        "The doer marked that they were struggling and asked for help in real time.",
      createdAt: serverTimestamp(),
    });

    onTrigger?.();
  };

  return (
    <button
      className="bg-red-500 hover:bg-red-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0 whitespace-nowrap shrink-0"
      onClick={handleClick}
      type="button"
    >
      I'm Struggling
    </button>
  );
}
