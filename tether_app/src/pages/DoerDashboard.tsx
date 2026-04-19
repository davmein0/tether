import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import MessageList from "../components/MessageList";
import StruggleButton from "../components/StruggleButton";
import TemptationRoutine from "../components/TemptationRoutine";
import { db } from "../services/firebase";

type Props = {
  relationshipId: string;
  currentUserId: string;
};

export default function DoerDashboard({ relationshipId, currentUserId }: Props) {
  const [draft, setDraft] = useState("");
  const [showRoutine, setShowRoutine] = useState(false);

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

  const eyebrow =
    "mb-[10px] text-[#7c2d12] text-[0.78rem] font-bold tracking-[0.18em] uppercase";

  const primaryButton =
    "border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#b45309,#7c2d12)] text-[#fff9f1] font-bold transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)] disabled:cursor-wait disabled:opacity-70 disabled:translate-y-0 disabled:[box-shadow:none]";

  return (
    <section className="flex flex-col gap-5 p-6 border border-[rgba(109,83,56,0.16)] rounded-[28px] bg-[linear-gradient(145deg,rgba(255,249,241,0.98),rgba(250,238,223,0.92))] [box-shadow:var(--shadow-panel)] backdrop-blur-[10px] max-sm:p-[18px] max-sm:rounded-[22px]">
      <div className="flex justify-between gap-5 items-stretch max-lg:flex-col max-lg:items-stretch">
        <div>
          <p className={eyebrow}>Doer dashboard</p>
          <h3 className="max-w-[680px] font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">
            Use this space for live support while goals and timeline live on their own pages.
          </h3>
        </div>

        <div className="min-w-[220px] p-[18px] rounded-[22px] bg-[linear-gradient(180deg,#fff3e3,#f6dfc8)] text-[#7c2d12]">
          <span className="block mb-2 text-[0.8rem] font-bold tracking-[0.08em] uppercase">Live support</span>
          <strong className="block mb-2 text-[1.35rem]">Reach out in real time</strong>
          <p className="text-[#8a7461]">Send a quick update or raise a high-priority struggle alert when you need backup.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <section className="flex flex-col gap-[18px] p-[22px] border border-[rgba(109,83,56,0.16)] rounded-[24px] bg-[#fff9f1] col-span-full max-sm:p-[18px] max-sm:rounded-[22px]">
          <div className="flex justify-between items-start gap-4 max-lg:flex-col max-lg:items-stretch">
            <div>
              <p className={eyebrow}>Real-time support</p>
              <h4 className="font-[600] text-[1.55rem] leading-[1.05] [font-family:var(--font-sans)] text-[#1f1711]">Stay connected to your supporter</h4>
            </div>
            <StruggleButton
              onTrigger={() => setShowRoutine(true)}
              relationshipId={relationshipId}
            />
          </div>

          {showRoutine && (
            <TemptationRoutine onDismiss={() => setShowRoutine(false)} />
          )}

          <div className="flex flex-col gap-3">
            <label className="text-[0.92rem] font-bold text-[#1f1711]" htmlFor="support-message">
              Send a quick update
            </label>
            <textarea
              id="support-message"
              className="w-full min-h-[110px] resize-y p-[14px_16px] border border-[rgba(109,83,56,0.2)] rounded-[18px] bg-[#fffdfa] text-[#1f1711]"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Let them know what you need right now..."
              value={draft}
            />
            <div className="flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-stretch">
              <button className={primaryButton} onClick={sendSupportMessage} type="button">
                Send update
              </button>
              <p className="text-[#8a7461]">
                Use the struggle button when you want to raise a high-priority signal.
              </p>
            </div>
          </div>

          <div className="min-h-[220px] pt-[6px]">
            <MessageList
              currentUserId={currentUserId}
              peerLabel="Mentor"
              relationshipId={relationshipId}
            />
          </div>
        </section>
      </div>
    </section>
  );
}
