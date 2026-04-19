import DoerDashboard from "./DoerDashboard";
import SupporterDashboard from "./SupporterDashboard";

export default function DashboardRouter() {
  return (
    <div className="flex gap-10">
      <DoerDashboard relationshipId="r1" currentUserId="dev" />
      <SupporterDashboard relationshipId="r1" currentUserId="dev" />
    </div>
  );
}
