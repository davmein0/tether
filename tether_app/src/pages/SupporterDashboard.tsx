import useLatestStruggle from "../hooks/useLatestStruggle";
import ResponseBox from "../components/ResponseBox";
import MessageList from "../components/MessageList";

type Props = {
  relationshipId: string;
  currentUserId: string;
};

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";
const card = "bg-stone-50 rounded-2xl border border-stone-100 flex flex-col gap-4 p-5";

export default function SupporterDashboard({ relationshipId, currentUserId }: Props) {
  const event = useLatestStruggle(relationshipId);

  return (
    <section className="bg-[#fafffe] rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-5 p-6">
      <div>
        <p className={eyebrow}>Mentor dashboard</p>
        <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
          Your encouragement makes the difference at the hardest moments.
        </h3>
      </div>

      {event && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="flex flex-col gap-1">
            <span className="bg-red-50 text-red-600 text-xs font-semibold px-3 py-1 rounded-full self-start">Needs you now</span>
            <h4 className="text-lg font-semibold text-stone-800">They're struggling</h4>
            <p className="text-stone-600 text-sm leading-relaxed">A high-priority signal was just sent — respond below.</p>
          </div>
        </div>
      )}

      <div className={card}>
        <div className="flex justify-between items-center gap-4 mb-4">
          <div>
            <p className={eyebrow}>Send a message</p>
            <h4 className="text-lg font-semibold text-stone-800">Reach out anytime</h4>
          </div>
        </div>
        <ResponseBox
          mood={event?.mood}
          relationshipId={relationshipId}
          senderId={currentUserId}
        />
      </div>

      <div className={card}>
        <div className="flex justify-between items-center gap-4 mb-4">
          <div>
            <p className={eyebrow}>Conversation</p>
            <h4 className="text-lg font-semibold text-stone-800">Your shared thread</h4>
          </div>
        </div>
        <MessageList
          currentUserId={currentUserId}
          peerLabel="Them"
          relationshipId={relationshipId}
        />
      </div>
    </section>
  );
}
