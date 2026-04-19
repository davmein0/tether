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
      className="border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#c2410c,#7c2d12)] text-[#fff9f1] font-bold whitespace-nowrap flex-shrink-0 transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)]"
      onClick={handleClick}
      type="button"
    >
      I'm Struggling
    </button>
  );
}
