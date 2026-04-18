import DoerDashboard from "./DoerDashboard";
import SupporterDashboard from "./SupporterDashboard";

export default function DashboardRouter() {
  return (
    <div style={{ display: "flex", gap: "40px" }}>
      <DoerDashboard relationshipId="r1" />
      <SupporterDashboard relationshipId="r1" />
    </div>
  );
}
