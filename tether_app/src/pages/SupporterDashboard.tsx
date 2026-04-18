import useLatestStruggle from "../hooks/useLatestStruggle";
import ResponseBox from "../components/ResponseBox";
import MessageList from "../components/MessageList";

export default function SupporterDashboard() {
  const relationshipId = "r1";
  const event = useLatestStruggle(relationshipId);

  return (
    <div>
      <h3>Supporter</h3>

      {event && <p>⚠️ They are struggling</p>}

      {event && (
        <ResponseBox relationshipId={relationshipId} mood={event.mood} />
      )}

      <MessageList relationshipId={relationshipId} />
    </div>
  );
}
