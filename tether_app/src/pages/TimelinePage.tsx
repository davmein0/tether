import TimelineBoard from "../components/TimelineBoard";

type Props = {
  relationshipId: string;
};

export default function TimelinePage({ relationshipId }: Props) {
  return (
    <section className="dashboard-panel dashboard-panel-timeline">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Timeline</p>
          <h3>Track reachouts, meetings, and daily progress in one running view of support.</h3>
        </div>

        <div className="dashboard-highlight">
          <span className="dashboard-highlight-label">Timeline types</span>
          <strong>Reachouts, meetings, metrics</strong>
          <p>Every key moment now gets its own place instead of being nested in the dashboard.</p>
        </div>
      </div>

      <TimelineBoard relationshipId={relationshipId} />
    </section>
  );
}
