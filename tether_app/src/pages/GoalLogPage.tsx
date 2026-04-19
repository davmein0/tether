import useGoals from "../hooks/useGoals";

type Props = {
  relationshipId: string;
};

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";

export default function GoalLogPage({ relationshipId }: Props) {
  const goals = useGoals(relationshipId);

  return (
    <section className="bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-5 p-6">
      <div className="flex justify-between gap-5 items-stretch">
        <div>
          <p className={eyebrow}>Goal log</p>
          <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
            Capture shared goals with a clear date range before bringing them
            into weekly review.
          </h3>
        </div>

        <div className="min-w-[220px] p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700">Goal setup</span>
          <strong className="text-stone-800 text-lg font-semibold">Time-boxed goals</strong>
          <p className="text-stone-600 text-sm leading-relaxed">
            Each goal now has a start date, end date, and status instead of a
            fixed cadence field.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <section className="bg-stone-50 rounded-2xl border border-stone-100 flex flex-col gap-4 p-5">
          <div className="flex justify-between items-center gap-4 mb-4">
            <div>
              <p className={eyebrow}>Saved goals</p>
              <h4 className="text-lg font-semibold text-stone-800">Current goals in this relationship</h4>
            </div>
            <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">{goals.length} total</span>
          </div>

          <div className="flex flex-col gap-3">
            {goals.length === 0 ? (
              <p className="text-stone-400 text-xs p-4 rounded-xl border border-dashed border-stone-200 bg-white">
                No goals yet. Add one to start building your shared roadmap.
              </p>
            ) : (
              goals.map((goal, index) => (
                <article
                  className="bg-white rounded-xl border border-stone-100 flex flex-col gap-3 p-4"
                  key={`${goal.title}-${index}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-stone-800">{goal.title}</h5>
                      <p className="text-stone-600 text-sm leading-relaxed">{goal.description}</p>
                    </div>
                    <span className="bg-stone-100 text-stone-600 text-xs font-semibold px-3 py-1 rounded-full shrink-0">{goal.status}</span>
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
      </div>
    </section>
  );
}
