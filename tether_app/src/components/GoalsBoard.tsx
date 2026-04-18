import useGoals from "../hooks/useGoals";

type Props = {
  relationshipId: string;
  limit?: number;
  showHeader?: boolean;
};

export default function GoalsBoard({
  relationshipId,
  limit,
  showHeader = true,
}: Props) {
  const goals = useGoals(relationshipId);
  const visibleGoals = limit ? goals.slice(0, limit) : goals;

  return (
    <section className="card">
      {showHeader ? (
        <div className="section-heading">
          <div>
            <p className="eyebrow">Goals</p>
            <h4>What you are working toward</h4>
          </div>
          <span className="section-badge">{goals.length} active</span>
        </div>
      ) : null}

      <div className="goal-list">
        {goals.length === 0 ? (
          <p className="empty-state">
            No goals logged yet. Use the goal page to add a dated goal.
          </p>
        ) : (
          visibleGoals.map((goal, index) => (
            <article className="goal-card" key={`${goal.title}-${goal.targetLabel}-${index}`}>
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
  );
}
