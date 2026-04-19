import { Timestamp } from "firebase/firestore";
import GoalsBoard from "../components/GoalsBoard";
import MessageList from "../components/MessageList";
import ResponseBox from "../components/ResponseBox";
import useLatestStruggle from "../hooks/useLatestStruggle";
import useTimelineEntries from "../hooks/useTimelineEntries";

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

export default function SupporterDashboard({ relationshipId, currentUserId }: Props) {
  const event = useLatestStruggle(relationshipId);
  const entries = useTimelineEntries(relationshipId);
  const recentEntries = entries.slice(0, 4);

  return (
    <section className="bg-[#fafffe] rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <p className={eyebrow}>Mentor dashboard</p>
        <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
          Your encouragement makes the difference at the hardest moments.
        </h3>
      </div>

      {/* Struggle alert — full width, prominent */}
      {event && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-red-600 text-lg font-bold">!</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full self-start">
              Needs you now
            </span>
            <h4 className="text-base font-semibold text-stone-800 mt-1">They're struggling right now</h4>
            <p className="text-stone-600 text-sm leading-relaxed">
              A high-priority signal was just sent — respond below to let them know you're here.
            </p>
          </div>
        </div>
      )}

      {/* Goals + Recent activity */}
      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <div className="flex flex-col gap-2">
          <p className={eyebrow}>Their goals</p>
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

      {/* Respond + conversation */}
      <div className={card}>
        <div>
          <p className={eyebrow}>Send a message</p>
          <h4 className="text-lg font-semibold text-stone-800">Reach out anytime</h4>
        </div>
        <ResponseBox
          mood={event?.mood}
          relationshipId={relationshipId}
          senderId={currentUserId}
        />
      </div>

      <div className={card}>
        <div>
          <p className={eyebrow}>Conversation</p>
          <h4 className="text-lg font-semibold text-stone-800">Your shared thread</h4>
        </div>
        <MessageList
          currentUserId={currentUserId}
          peerLabel="Mentee"
          relationshipId={relationshipId}
        />
      </div>
    </section>
  );
}
