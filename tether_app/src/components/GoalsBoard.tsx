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

  const eyebrow =
    "mb-[10px] text-[#7c2d12] text-[0.78rem] font-bold tracking-[0.18em] uppercase";

  return (
    <section className="flex flex-col gap-[18px] p-[22px] border border-[rgba(109,83,56,0.16)] rounded-[24px] bg-[#fff9f1] max-sm:p-[18px] max-sm:rounded-[22px]">
      {showHeader ? (
        <div className="flex justify-between items-start gap-4 max-lg:flex-col max-lg:items-stretch">
          <div>
            <p className={eyebrow}>Goals</p>
            <h4 className="font-[600] text-[1.55rem] leading-[1.05] [font-family:var(--font-sans)] text-[#1f1711]">What you are working toward</h4>
          </div>
          <span className="inline-flex items-center justify-center px-3 py-[7px] rounded-full bg-[#fff1de] text-[#7c2d12] text-[0.86rem] font-bold">
            {goals.length} active
          </span>
        </div>
      ) : null}

      <div className="grid gap-[14px]">
        {goals.length === 0 ? (
          <p className="p-[18px] rounded-[18px] border border-dashed border-[rgba(109,83,56,0.24)] bg-[rgba(255,250,244,0.76)] text-[#8a7461]">
            No goals logged yet. Use the goal page to add a dated goal.
          </p>
        ) : (
          visibleGoals.map((goal, index) => (
            <article
              className="flex flex-col gap-3 p-[18px] border border-[rgba(109,83,56,0.16)] rounded-[20px] bg-[linear-gradient(180deg,#fffdfa,#fcf2e7)]"
              key={`${goal.title}-${goal.targetLabel}-${index}`}
            >
              <div className="flex justify-between gap-4 items-start max-lg:flex-col max-lg:items-stretch">
                <div>
                  <h5 className="mb-1 text-[#1f1711] font-[600] text-[1.08rem] leading-[1.2] [font-family:var(--font-ui)]">{goal.title}</h5>
                  <p className="text-[#8a7461]">{goal.description}</p>
                </div>
                <span className="inline-flex items-center justify-center px-3 py-[7px] rounded-full bg-[#fff1de] text-[#7c2d12] text-[0.86rem] font-bold">
                  {goal.status}
                </span>
              </div>

              <p className="text-[0.94rem] font-[600]">{goal.targetLabel}</p>
              <div className="flex flex-wrap gap-3 text-[#8a7461] text-[0.84rem] font-bold">
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
