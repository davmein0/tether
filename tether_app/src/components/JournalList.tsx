import { useEffect, useRef, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import JournalComments from "./JournalComments";
import type { JournalEntry } from "../types";
import "./JournalList.css";

type Props = {
  relationshipId: string;
  userId?: string;
  currentUserId?: string;
  peerLabel?: string;
};

function formatDate(createdAt: unknown): string {
  if (!createdAt) return "";
  const date = (createdAt as Timestamp).toDate();
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function JournalList({
  relationshipId,
  userId,
  currentUserId,
  peerLabel = "Them",
}: Props) {
  const [entries, setEntries] = useState<(JournalEntry & { id: string })[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let q = query(
      collection(db, "journalEntries"),
      where("relationshipId", "==", relationshipId),
    );

    if (userId) {
      q = query(
        collection(db, "journalEntries"),
        where("relationshipId", "==", relationshipId),
        where("userId", "==", userId),
      );
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (JournalEntry & { id: string })[];

      entries.sort((a, b) => {
        const aTime = (a.createdAt as Timestamp)?.seconds ?? 0;
        const bTime = (b.createdAt as Timestamp)?.seconds ?? 0;
        return bTime - aTime; // Most recent first
      });

      setEntries(entries);
    });

    return unsub;
  }, [relationshipId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="journal-list-empty">
        <p>
          No journal entries yet. Start writing to capture your thoughts and
          progress.
        </p>
      </div>
    );
  }

  return (
    <div className="journal-list">
      {entries.map((entry) => (
        <article className="journal-entry-item" key={entry.id}>
          <div className="entry-header">
            <time className="entry-date">{formatDate(entry.createdAt)}</time>
          </div>
          <div className="entry-content">
            {entry.imageUrl && (
              <div className="entry-image">
                <img src={entry.imageUrl} alt="Journal entry" loading="lazy" />
              </div>
            )}
            {entry.text && <p className="entry-text">{entry.text}</p>}
          </div>
          {currentUserId && (
            <JournalComments
              entryId={entry.id}
              currentUserId={currentUserId}
              peerLabel={peerLabel}
              isOwnEntry={entry.userId === currentUserId}
            />
          )}
        </article>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
