import { useEffect, useRef, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
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
  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
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
    <div className="max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
      <div className="flex flex-col gap-3">
        {messages.map((m, i) => {
          const isOwn = m.senderId === currentUserId;
          return (
            <article
              className={
                isOwn
                  ? "self-end bg-amber-700 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%] flex flex-col gap-1"
                  : "self-start bg-stone-100 text-stone-900 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] flex flex-col gap-1"
              }
              key={`${m.senderId}-${i}-${m.text}`}
            >
              <span
                className={
                  isOwn
                    ? "text-[10px] font-semibold uppercase tracking-wider mb-1 text-white/50"
                    : "text-[10px] font-semibold uppercase tracking-wider mb-1 text-stone-400"
                }
              >
                {isOwn ? "You" : peerLabel}
              </span>
              <p
                className={
                  isOwn ? "text-white text-sm" : "text-stone-900 text-sm"
                }
              >
                {m.text}
              </p>
              <span
                className={
                  isOwn
                    ? "text-[10px] mt-1 text-white/60"
                    : "text-[10px] mt-1 text-stone-400"
                }
              >
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
