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

  return (
    <section className="dashboard-panel dashboard-panel-doer">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Doer dashboard</p>
          <h3>Use this space for live support while goals and timeline live on their own pages.</h3>
        </div>

        <div className="dashboard-highlight">
          <span className="dashboard-highlight-label">Live support</span>
          <strong>Reach out in real time</strong>
          <p>Send a quick update or raise a high-priority struggle alert when you need backup.</p>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-single">
        <section className="card support-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Real-time support</p>
              <h4>Stay connected to your supporter</h4>
            </div>
            <StruggleButton
              onTrigger={() => setShowRoutine(true)}
              relationshipId={relationshipId}
            />
          </div>

          {showRoutine && (
            <TemptationRoutine onDismiss={() => setShowRoutine(false)} />
          )}

          <div className="support-composer">
            <label className="support-label" htmlFor="support-message">
              Send a quick update
            </label>
            <textarea
              id="support-message"
              className="support-textarea"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Let them know what you need right now..."
              value={draft}
            />
            <div className="support-actions">
              <button className="primary-button" onClick={sendSupportMessage} type="button">
                Send update
              </button>
              <p className="support-hint">
                Use the struggle button when you want to raise a high-priority signal.
              </p>
            </div>
          </div>

          <div className="chat-feed">
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
