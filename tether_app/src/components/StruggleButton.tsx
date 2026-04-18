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
  };

  return (
    <button className="struggle-button" onClick={handleClick} type="button">
      I'm Struggling
    </button>
  );
}
