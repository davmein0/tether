import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

type Props = {
  relationshipId: string;
};

export default function StruggleButton({ relationshipId }: Props) {
  const handleClick = async () => {
    await addDoc(collection(db, "events"), {
      relationshipId,
      type: "struggle",
      mood: "stress",
      createdAt: serverTimestamp(),
    });
  };

  return <button onClick={handleClick}>I'm Struggling</button>;
}
