import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { getSuggestedResponse } from "../services/api";
import type { Mood } from "../types";

type Props = {
  relationshipId: string;
  mood?: Mood;
};

export default function ResponseBox({ relationshipId, mood }: Props) {
  const [text, setText] = useState(getSuggestedResponse(mood));

  const sendMessage = async () => {
    await addDoc(collection(db, "messages"), {
      relationshipId,
      senderId: "supporter",
      text,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
