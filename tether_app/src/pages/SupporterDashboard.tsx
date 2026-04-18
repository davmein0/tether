import useLatestStruggle from "../hooks/useLatestStruggle";
import ResponseBox from "../components/ResponseBox";
import MessageList from "../components/MessageList";

type Props = {
  relationshipId: string;
  currentUserId: string;
};

export default function SupporterDashboard({ relationshipId, currentUserId }: Props) {
  const event = useLatestStruggle(relationshipId);

  return (
    <section className="dashboard-panel dashboard-panel-supporter">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Mentor dashboard</p>
          <h3>Your encouragement makes the difference at the hardest moments.</h3>
        </div>
      </div>

      {event && (
        <div className="alert-card">
          <div className="alert-card-header">
            <span className="alert-badge">Needs you now</span>
            <h4>They're struggling</h4>
            <p>A high-priority signal was just sent — respond below.</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Send a message</p>
            <h4>Reach out anytime</h4>
          </div>
        </div>
        <ResponseBox
          mood={event?.mood}
          relationshipId={relationshipId}
          senderId={currentUserId}
        />
      </div>

      <div className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Conversation</p>
            <h4>Your shared thread</h4>
          </div>
        </div>
        <div className="chat-feed">
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
