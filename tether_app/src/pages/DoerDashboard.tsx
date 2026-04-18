import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import MessageList from "../components/MessageList";
import StruggleButton from "../components/StruggleButton";
import TemptationRoutine from "../components/TemptationRoutine";
import { db } from "../services/firebase";

const goals = [
  {
    title: "Reduce stress spirals",
    target: "Use a reset tool 4 times this week",
    progressLabel: "3 of 4 resets logged",
    progressValue: 75,
    status: "On track",
  },
  {
    title: "Protect focus blocks",
    target: "Keep two distraction-free sessions each day",
    progressLabel: "8 of 10 blocks completed",
    progressValue: 80,
    status: "Strong streak",
  },
  {
    title: "Ask for help earlier",
    target: "Reach out before stress hits 8/10",
    progressLabel: "2 check-ins started proactively",
    progressValue: 55,
    status: "Building momentum",
  },
] as const;

const timelineEntries = [
  {
    day: "Mon",
    title: "Morning routine completed",
    detail: "Started the day with a short walk and a focused planning block.",
    tone: "win",
  },
  {
    day: "Tue",
    title: "Midday check-in",
    detail: "Stress rose after lunch, but you paused before it snowballed.",
    tone: "steady",
  },
  {
    day: "Wed",
    title: "Support request sent",
    detail: "You flagged that work felt heavy and asked for encouragement in real time.",
    tone: "support",
  },
  {
    day: "Thu",
    title: "Focus block recovered",
    detail: "Restarted after a rough hour and still finished the most important task.",
    tone: "win",
  },
] as const;

export default function DoerDashboard() {
  const relationshipId = "r1";
  const [draft, setDraft] = useState("");
  const [showRoutine, setShowRoutine] = useState(false);

  const sendSupportMessage = async () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) return;

    await addDoc(collection(db, "messages"), {
      relationshipId,
      senderId: "doer",
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
          <h3>Keep your goals visible, your progress tangible, and support one tap away.</h3>
        </div>

        <div className="dashboard-highlight">
          <span className="dashboard-highlight-label">Weekly pulse</span>
          <strong>7 supportive touchpoints</strong>
          <p>Small check-ins are turning into steadier routines.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Goals</p>
              <h4>What you are working toward</h4>
            </div>
            <span className="section-badge">3 active</span>
          </div>

          <div className="goal-list">
            {goals.map((goal) => (
              <article className="goal-card" key={goal.title}>
                <div className="goal-card-header">
                  <div>
                    <h5>{goal.title}</h5>
                    <p>{goal.target}</p>
                  </div>
                  <span className="goal-status">{goal.status}</span>
                </div>

                <div className="goal-progress">
                  <div
                    className="goal-progress-bar"
                    style={{ width: `${goal.progressValue}%` }}
                  />
                </div>

                <p className="goal-progress-label">{goal.progressLabel}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Progress timeline</p>
              <h4>How this week has unfolded</h4>
            </div>
          </div>

          <div className="timeline">
            {timelineEntries.map((entry) => (
              <article className="timeline-item" key={`${entry.day}-${entry.title}`}>
                <div className={`timeline-marker timeline-marker-${entry.tone}`}>
                  {entry.day}
                </div>
                <div className="timeline-content">
                  <h5>{entry.title}</h5>
                  <p>{entry.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

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
            <MessageList relationshipId={relationshipId} />
          </div>
        </section>
      </div>
    </section>
  );
}
