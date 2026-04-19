import { useEffect, useRef, useState } from "react";
import { Timestamp, collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Message } from "../types";

type Props = {
  relationshipId: string;
  currentUserId: string;
  peerLabel?: string;
};

function formatTime(createdAt: unknown): string {
  if (!createdAt) return "";
  const date = (createdAt as Timestamp).toDate();
  const now = new Date();
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) return time;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} · ${time}`;
}

export default function MessageList({
  relationshipId,
  currentUserId,
  peerLabel = "Them",
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("relationshipId", "==", relationshipId),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => d.data() as Message);
      msgs.sort((a, b) => {
        const aTime = (a.createdAt as Timestamp)?.seconds ?? 0;
        const bTime = (b.createdAt as Timestamp)?.seconds ?? 0;
        return aTime - bTime;
      });
      setMessages(msgs);
    });

    return unsub;
  }, [relationshipId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-scroll">
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
              <span className="message-time">{formatTime(m.createdAt)}</span>
            </article>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
