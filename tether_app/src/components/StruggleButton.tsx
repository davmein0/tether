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
    onTrigger?.();
  };

  return (
    <button className="struggle-button" onClick={handleClick} type="button">
      I'm Struggling
    </button>
  );
}
