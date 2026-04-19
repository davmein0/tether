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
    <div className="max-h-[420px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:var(--color-panel-tint)_transparent]">
      <div className="flex flex-col gap-3">
        {messages.map((m, i) => {
          const isOwn = m.senderId === currentUserId;
          return (
            <article
              className={`max-w-[88%] flex flex-col gap-1 p-[14px_16px] rounded-[20px] border border-[rgba(109,83,56,0.16)] max-lg:max-w-full ${
                isOwn
                  ? "self-end bg-[#f4dfc7]"
                  : "self-start bg-[#f2f6f2]"
              }`}
              key={`${m.senderId}-${i}-${m.text}`}
            >
              <span className="text-[0.78rem] font-bold tracking-[0.06em] uppercase text-[#8a7461]">
                {isOwn ? "You" : peerLabel}
              </span>
              <p className="text-[#1f1711]">{m.text}</p>
              <span className="mt-[2px] text-[0.72rem] text-[#8a7461] opacity-70">
                {formatTime(m.createdAt)}
              </span>
            </article>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
