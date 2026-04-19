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

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";

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

  return (
    <section className="bg-[#fffcf9] rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-5 p-6">
      <div className="flex justify-between gap-5 items-stretch">
        <div>
          <p className={eyebrow}>Doer dashboard</p>
          <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
            Use this space for live support while goals and timeline live on their own pages.
          </h3>
        </div>

        <div className="min-w-[220px] p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700">Live support</span>
          <strong className="text-stone-800 text-lg font-semibold">Reach out in real time</strong>
          <p className="text-stone-600 text-sm leading-relaxed">Send a quick update or raise a high-priority struggle alert when you need backup.</p>
        </div>
      </div>

      <section className="bg-stone-50 rounded-2xl border border-stone-100 flex flex-col gap-4 p-5">
        <div className="flex justify-between items-center gap-4 mb-4">
          <div>
            <p className={eyebrow}>Real-time support</p>
            <h4 className="text-lg font-semibold text-stone-800">Stay connected to your supporter</h4>
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
          <label className="text-sm font-semibold text-stone-800" htmlFor="support-message">
            Send a quick update
          </label>
          <textarea
            id="support-message"
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Let them know what you need right now..."
            rows={4}
            value={draft}
          />
          <div className="flex items-center justify-between gap-4">
            <button
              className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0"
              onClick={sendSupportMessage}
              type="button"
            >
              Send update
            </button>
            <p className="text-stone-400 text-xs">
              Use the struggle button when you want to raise a high-priority signal.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <MessageList
            currentUserId={currentUserId}
            peerLabel="Mentor"
            relationshipId={relationshipId}
          />
        </div>
      </section>
    </section>
  );
}
