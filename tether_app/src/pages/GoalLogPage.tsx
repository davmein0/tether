import useGoals from "../hooks/useGoals";

type Props = {
  relationshipId: string;
};

export default function GoalLogPage({ relationshipId }: Props) {
  const goals = useGoals(relationshipId);

  return (
    <section className="dashboard-panel dashboard-panel-goals">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Goal log</p>
          <h3>
            Capture shared goals with a clear date range before bringing them
            into weekly review.
          </h3>
        </div>

        <div className="dashboard-highlight">
          <span className="dashboard-highlight-label">Goal setup</span>
          <strong>Time-boxed goals</strong>
          <p>
            Each goal now has a start date, end date, and status instead of a
            fixed cadence field.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Saved goals</p>
              <h4>Current goals in this relationship</h4>
            </div>
            <span className="section-badge">{goals.length} total</span>
          </div>

          <div className="goal-list">
            {goals.length === 0 ? (
              <p className="empty-state">
                No goals yet. Add one to start building your shared roadmap.
              </p>
            ) : (
              goals.map((goal, index) => (
                <article className="goal-card" key={`${goal.title}-${index}`}>
                  <div className="goal-card-header">
                    <div>
                      <h5>{goal.title}</h5>
                      <p>{goal.description}</p>
                    </div>
                    <span className="goal-status">{goal.status}</span>
                  </div>

                  <p className="goal-progress-label">{goal.targetLabel}</p>
                  <div className="rating-row">
                    <span>Start: {goal.startDate}</span>
                    <span>End: {goal.endDate}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
