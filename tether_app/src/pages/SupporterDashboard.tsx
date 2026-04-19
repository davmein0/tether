import useLatestStruggle from "../hooks/useLatestStruggle";
import ResponseBox from "../components/ResponseBox";
import MessageList from "../components/MessageList";

type Props = {
  relationshipId: string;
  currentUserId: string;
};

export default function SupporterDashboard({ relationshipId, currentUserId }: Props) {
  const event = useLatestStruggle(relationshipId);

  const eyebrow =
    "mb-[10px] text-[#7c2d12] text-[0.78rem] font-bold tracking-[0.18em] uppercase";

  const card =
    "flex flex-col gap-[18px] p-[22px] border border-[rgba(109,83,56,0.16)] rounded-[24px] bg-[#fff9f1] max-sm:p-[18px] max-sm:rounded-[22px]";

  return (
    <section className="flex flex-col gap-5 p-6 border border-[rgba(109,83,56,0.16)] rounded-[28px] bg-[linear-gradient(180deg,rgba(255,250,244,0.98),rgba(245,235,223,0.92))] [box-shadow:var(--shadow-panel)] backdrop-blur-[10px] max-sm:p-[18px] max-sm:rounded-[22px]">
      <div className="flex justify-between gap-5 items-stretch max-lg:flex-col max-lg:items-stretch">
        <div>
          <p className={eyebrow}>Mentor dashboard</p>
          <h3 className="max-w-[680px] font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">
            Your encouragement makes the difference at the hardest moments.
          </h3>
        </div>
      </div>

      {event && (
        <div className="flex flex-col gap-[14px] p-[22px] border border-[rgba(180,83,9,0.3)] rounded-[24px] bg-[linear-gradient(160deg,#fff8ee,#fdefd8)]">
          <div className="flex flex-col gap-[6px]">
            <span className="inline-flex items-center px-3 py-[5px] rounded-full bg-[#fee2b2] text-[#92400e] text-[0.78rem] font-bold tracking-[0.1em] uppercase">
              Needs you now
            </span>
            <h4 className="font-[600] text-[1.45rem] leading-[1.1] [font-family:var(--font-sans)] text-[#1f1711]">They're struggling</h4>
            <p className="text-[#8a7461]">A high-priority signal was just sent — respond below.</p>
          </div>
        </div>
      )}

      <div className={card}>
        <div className="flex justify-between items-start gap-4 max-lg:flex-col max-lg:items-stretch">
          <div>
            <p className={eyebrow}>Send a message</p>
            <h4 className="font-[600] text-[1.55rem] leading-[1.05] [font-family:var(--font-sans)] text-[#1f1711]">Reach out anytime</h4>
          </div>
        </div>
        <ResponseBox
          mood={event?.mood}
          relationshipId={relationshipId}
          senderId={currentUserId}
        />
      </div>

      <div className={card}>
        <div className="flex justify-between items-start gap-4 max-lg:flex-col max-lg:items-stretch">
          <div>
            <p className={eyebrow}>Conversation</p>
            <h4 className="font-[600] text-[1.55rem] leading-[1.05] [font-family:var(--font-sans)] text-[#1f1711]">Your shared thread</h4>
          </div>
        </div>
        <div className="min-h-[220px] pt-[6px]">
          <MessageList
            currentUserId={currentUserId}
            peerLabel="Them"
            relationshipId={relationshipId}
          />
        </div>
      </div>
    </section>
  );
}
