import useLatestStruggle from "../hooks/useLatestStruggle";
import ResponseBox from "../components/ResponseBox";
import MessageList from "../components/MessageList";

type Props = {
  relationshipId: string;
};

export default function SupporterDashboard({ relationshipId }: Props) {
  const event = useLatestStruggle(relationshipId);

  return (
    <section className="dashboard-panel dashboard-panel-supporter">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Mentor dashboard</p>
          <h3>Your encouragement makes the difference at the hardest moments.</h3>
        </div>
      </div>

      {event ? (
        <div className="alert-card">
          <div className="alert-card-header">
            <span className="alert-badge">Needs you now</span>
            <h4>They're struggling</h4>
            <p>Choose a response below or write your own — then send it.</p>
          </div>
          <ResponseBox mood={event.mood} relationshipId={relationshipId} />
        </div>
      ) : (
        <div className="card mentor-idle-card">
          <p className="eyebrow">All quiet</p>
          <p>You'll get an alert here the moment they need support.</p>
        </div>
      )}

      <div className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Conversation</p>
            <h4>Your shared thread</h4>
          </div>
        </div>
        <div className="chat-feed">
          <MessageList relationshipId={relationshipId} />
        </div>
      </div>
    </section>
  );
}
