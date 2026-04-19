import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import GoalsBoard from "../components/GoalsBoard";
import MessageList from "../components/MessageList";
import StruggleButton from "../components/StruggleButton";
import TemptationRoutine from "../components/TemptationRoutine";
import useTimelineEntries from "../hooks/useTimelineEntries";
import { db } from "../services/firebase";

type Props = {
  relationshipId: string;
  currentUserId: string;
};

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";
const card = "bg-stone-50 rounded-2xl border border-stone-100 flex flex-col gap-4 p-5";

const badgeColor: Record<string, string> = {
  goal: "bg-emerald-50 text-emerald-700",
  reachout: "bg-teal-50 text-teal-700",
  meeting: "bg-amber-50 text-amber-700",
  metric: "bg-stone-100 text-stone-600",
};

const typeLabel: Record<string, string> = {
  goal: "Goal",
  reachout: "Reachout",
  meeting: "Meeting",
  metric: "Metric",
};

function toDate(createdAt: unknown): Date | null {
  if (!createdAt) return null;
  if (typeof createdAt === "object" && createdAt !== null && "toDate" in createdAt) {
    return (createdAt as Timestamp).toDate();
  }
  return null;
}

export default function DoerDashboard({ relationshipId, currentUserId }: Props) {
  const [draft, setDraft] = useState("");
  const [showRoutine, setShowRoutine] = useState(false);
  const entries = useTimelineEntries(relationshipId);
  const recentEntries = entries.slice(0, 4);

  const sendSupportMessage = async () => {
    const trimmedDraft = draft.trim();
    if (!trimmedDraft) return;
    await addDoc(collection(db, "messages"), {
      relationshipId,
      senderId: currentUserId,
      text: trimmedDraft,
      createdAt: serverTimestamp(),
    });
    setDraft("");
  };

  return (
    <section className="bg-[#fffcf9] rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex justify-between gap-5 items-start max-lg:flex-col">
        <div>
          <p className={eyebrow}>Mentee dashboard</p>
          <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
            Track your goals, see what's happening, and reach out when you need support.
          </h3>
        </div>
        <div className="shrink-0">
          <StruggleButton
            onTrigger={() => setShowRoutine(true)}
            relationshipId={relationshipId}
          />
        </div>
      </div>

      {showRoutine && (
        <TemptationRoutine onDismiss={() => setShowRoutine(false)} />
      )}

      {/* Goals + Recent activity */}
      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <div className="flex flex-col gap-2">
          <p className={eyebrow}>Active goals</p>
          <GoalsBoard limit={3} relationshipId={relationshipId} showHeader={false} />
        </div>

        <div className={card}>
          <div>
            <p className={eyebrow}>Recent activity</p>
            <h4 className="text-base font-semibold text-stone-800">Latest events in this relationship</h4>
          </div>
          {recentEntries.length === 0 ? (
            <p className="text-stone-400 text-xs p-4 rounded-xl border border-dashed border-stone-200 bg-white">
              No events logged yet. Activity appears here as goals start and reachouts happen.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentEntries.map((entry, i) => {
                const date = toDate(entry.createdAt);
                return (
                  <div
                    className="flex gap-3 items-start bg-white border border-stone-100 rounded-xl px-4 py-3"
                    key={i}
                  >
                    <span
                      className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md mt-0.5 ${
                        badgeColor[entry.type] ?? "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {typeLabel[entry.type] ?? entry.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 leading-snug truncate">
                        {entry.title}
                      </p>
                      {date && (
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          {" · "}
                          {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Live support */}
      <div className={card}>
        <div className="flex justify-between items-center gap-4 mb-1">
          <div>
            <p className={eyebrow}>Live support</p>
            <h4 className="text-lg font-semibold text-stone-800">Stay connected to your mentor</h4>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <textarea
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Let them know what you need right now..."
            rows={3}
            value={draft}
          />
          <div className="flex items-center gap-3">
            <button
              className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0"
              onClick={sendSupportMessage}
              type="button"
            >
              Send update
            </button>
            <p className="text-stone-400 text-xs">
              Use the struggle button above to send a high-priority signal.
            </p>
          </div>
        </div>

        <div className="pt-1">
          <MessageList
            currentUserId={currentUserId}
            peerLabel="Mentor"
            relationshipId={relationshipId}
          />
        </div>
      </div>
    </section>
  );
}
