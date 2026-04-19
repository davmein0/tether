import useGoals from "../hooks/useGoals";

type Props = {
  relationshipId: string;
  limit?: number;
  showHeader?: boolean;
};

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";

export default function GoalsBoard({
  relationshipId,
  limit,
  showHeader = true,
}: Props) {
  const goals = useGoals(relationshipId);
  const visibleGoals = limit ? goals.slice(0, limit) : goals;

  return (
    <section className="bg-stone-50 rounded-2xl border border-stone-100 flex flex-col gap-4 p-5">
      {showHeader ? (
        <div className="flex justify-between items-center gap-4 mb-4">
          <div>
            <p className={eyebrow}>Goals</p>
            <h4 className="text-lg font-semibold text-stone-800">What you are working toward</h4>
          </div>
          <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
            {goals.length} active
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {goals.length === 0 ? (
          <p className="text-stone-400 text-xs p-4 rounded-xl border border-dashed border-stone-200 bg-white">
            No goals logged yet. Use the goal page to add a dated goal.
          </p>
        ) : (
          visibleGoals.map((goal, index) => (
            <article
              className="bg-white rounded-xl border border-stone-100 flex flex-col gap-3 p-4"
              key={`${goal.title}-${goal.targetLabel}-${index}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h5 className="text-sm font-semibold text-stone-800">{goal.title}</h5>
                  <p className="text-stone-600 text-sm leading-relaxed">{goal.description}</p>
                </div>
                <span className="bg-stone-100 text-stone-600 text-xs font-semibold px-3 py-1 rounded-full shrink-0">
                  {goal.status}
                </span>
              </div>

              <p className="text-sm font-semibold text-stone-800">{goal.targetLabel}</p>
              <div className="flex flex-wrap gap-3 text-stone-400 text-xs font-semibold">
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
