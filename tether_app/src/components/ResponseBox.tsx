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

    await addDoc(collection(db, "messages"), {
      relationshipId,
      senderId,
      text: trimmed,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <div className="response-box">
      <p className="response-box-label">Quick responses</p>
      <div className="suggestion-chips">
        {suggestions.map((s) => (
          <button
            className={`suggestion-chip${text === s ? " suggestion-chip-active" : ""}`}
            key={s}
            onClick={() => setText(s)}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>

      <textarea
        className="support-textarea"
        onChange={(e) => setText(e.target.value)}
        placeholder="Or write your own response..."
        value={text}
      />

      <button className="primary-button" onClick={sendMessage} type="button">
        Send response
      </button>
    </div>
  );
}
