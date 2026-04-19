import { useEffect, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { JournalComment } from "../types";
import "./JournalComments.css";

type Props = {
  entryId: string;
  currentUserId: string;
  peerLabel: string;
  isOwnEntry: boolean;
};

function formatTime(createdAt: unknown): string {
  if (!createdAt) return "";
  const date = (createdAt as Timestamp).toDate();
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function JournalComments({
  entryId,
  currentUserId,
  peerLabel,
  isOwnEntry,
}: Props) {
  const [comments, setComments] = useState<(JournalComment & { id: string })[]>(
    [],
  );
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "journalEntries", entryId, "comments"),
      where("entryId", "==", entryId),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const commentsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (JournalComment & { id: string })[];

      commentsList.sort((a, b) => {
        const aTime = (a.createdAt as Timestamp)?.seconds ?? 0;
        const bTime = (b.createdAt as Timestamp)?.seconds ?? 0;
        return aTime - bTime; // Oldest first
      });

      setComments(commentsList);
    });

    return unsub;
  }, [entryId]);

  const handleSubmitComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "journalEntries", entryId, "comments"), {
        entryId,
        authorId: currentUserId,
        text: trimmed,
        createdAt: serverTimestamp(),
      });

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="journal-comments">
      <button
        className="journal-comments-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        <span className="comment-count">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
        <span className="toggle-arrow">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div className="journal-comments-section">
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">
                {isOwnEntry
                  ? `No comments yet. ${peerLabel} can share thoughts here.`
                  : "Be the first to comment"}
              </p>
            ) : (
              comments.map((comment) => {
                const isAuthor = comment.authorId === currentUserId;
                const authorLabel = isAuthor ? "You" : peerLabel;

                return (
                  <div className="comment-item" key={comment.id}>
                    <div className="comment-header">
                      <span className="comment-author">{authorLabel}</span>
                      <time className="comment-time">
                        {formatTime(comment.createdAt)}
                      </time>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                );
              })
            )}
          </div>

          {!isOwnEntry && (
            <form
              className="comment-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitComment();
              }}
            >
              <textarea
                className="comment-input"
                placeholder="Share a thought or encouragement..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
              <button
                className="comment-submit"
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post comment"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
