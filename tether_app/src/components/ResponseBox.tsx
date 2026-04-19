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
      <p className="text-sm font-semibold text-stone-800">Quick responses</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            className={
              text === s
                ? "text-xs font-medium px-3 py-2 rounded-lg border border-amber-400 bg-amber-50 text-amber-800 transition-colors text-left leading-snug"
                : "text-xs font-medium px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50 transition-colors text-left leading-snug"
            }
            key={s}
            onClick={() => setText(s)}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>

      <textarea
        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none"
        onChange={(e) => setText(e.target.value)}
        placeholder="Or write your own response..."
        rows={3}
        value={text}
      />

      <button
        className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0 self-start"
        onClick={sendMessage}
        type="button"
      >
        Send response
      </button>
    </div>
  );
}
