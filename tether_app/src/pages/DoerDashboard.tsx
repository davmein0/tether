import StruggleButton from "../components/StruggleButton";
import MessageList from "../components/MessageList";

export default function DoerDashboard() {
  const relationshipId = "r1";

  return (
    <div>
      <h3>Doer</h3>
      <StruggleButton relationshipId={relationshipId} />
      <MessageList relationshipId={relationshipId} />
    </div>
  );
}
