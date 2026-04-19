import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { getResponseSuggestions } from "../services/api";
import type { Mood } from "../types";

type Props = {
  relationshipId: string;
  senderId: string;
  mood?: Mood;
};

export default function ResponseBox({ relationshipId, senderId, mood }: Props) {
  const suggestions = getResponseSuggestions(mood);
  const [text, setText] = useState("");

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    console.log("Sending message:", {
      relationshipId,
      senderId,
      text: trimmed,
    });
    await addDoc(collection(db, "messages"), {
      relationshipId,
      senderId,
      text: trimmed,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[0.86rem] font-bold text-[#1f1711] tracking-[0.04em]">Quick responses</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            className={`rounded-full border px-[14px] py-[9px] text-[0.88rem] font-semibold text-left leading-[1.35] whitespace-normal transition-transform duration-[140ms] hover:translate-y-[-1px] hover:bg-[#fef0d8] hover:border-[#b45309] ${
              text === s
                ? "bg-[#fff1de] border-[#b45309] text-[#7c2d12]"
                : "bg-[#fff9f1] border-[rgba(180,83,9,0.3)] text-[#7c2d12]"
            }`}
            key={s}
            onClick={() => setText(s)}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>

      <textarea
        className="w-full min-h-[110px] resize-y p-[14px_16px] border border-[rgba(109,83,56,0.2)] rounded-[18px] bg-[#fffdfa] text-[#1f1711]"
        onChange={(e) => setText(e.target.value)}
        placeholder="Or write your own response..."
        value={text}
      />

      <button
        className="border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#b45309,#7c2d12)] text-[#fff9f1] font-bold transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)]"
        onClick={sendMessage}
        type="button"
      >
        Send response
      </button>
    </div>
  );
}
