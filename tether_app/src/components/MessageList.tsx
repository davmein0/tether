import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import type { Message } from "../types";

type Props = {
  relationshipId: string;
};

export default function MessageList({ relationshipId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("relationshipId", "==", relationshipId),
      orderBy("createdAt"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => d.data() as Message));
    });

    return unsub;
  }, [relationshipId]);

  return (
    <div>
      {messages.map((m, i) => (
        <p key={i}>{m.text}</p>
      ))}
    </div>
  );
}
