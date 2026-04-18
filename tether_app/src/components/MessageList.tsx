import { useEffect, useRef, useState } from "react";
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
  currentUserId: string;
  peerLabel?: string;
};

export default function MessageList({ relationshipId, currentUserId, peerLabel = "Them" }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((m, i) => {
        const isOwn = m.senderId === currentUserId;
        return (
          <article
            className={`message-bubble ${isOwn ? "message-bubble-doer" : "message-bubble-supporter"}`}
            key={`${m.senderId}-${i}-${m.text}`}
          >
            <span className="message-sender">{isOwn ? "You" : peerLabel}</span>
            <p>{m.text}</p>
          </article>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
