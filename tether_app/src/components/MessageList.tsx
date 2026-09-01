import { useEffect, useRef } from "react";
import { Timestamp, collection, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useFirestoreQuery } from "../hooks/useFirestoreQuery";
import { toMillis } from "../lib/timestamps";
import ErrorBanner from "./ErrorBanner";
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
  const { items, error } = useFirestoreQuery<Message>(
    () =>
      query(
        collection(db, "messages"),
        where("relationshipId", "==", relationshipId),
      ),
    [relationshipId],
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = [...items].sort(
    (a, b) => toMillis(a.createdAt) - toMillis(b.createdAt),
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
      <div className="flex flex-col gap-3">
        {error && (
          <ErrorBanner message="We couldn't load your messages. Check your connection and reload." />
        )}
        {messages.map((m) => {
          const isOwn = m.senderId === currentUserId;
          return (
            <article
              className={
                isOwn
                  ? "self-end bg-amber-700 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%] flex flex-col gap-1"
                  : "self-start bg-stone-100 text-stone-900 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] flex flex-col gap-1"
              }
              key={m.id}
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
