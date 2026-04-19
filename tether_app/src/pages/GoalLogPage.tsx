import useGoals from "../hooks/useGoals";

type Props = {
  relationshipId: string;
};

export default function GoalLogPage({ relationshipId }: Props) {
  const goals = useGoals(relationshipId);

  const eyebrow =
    "mb-[10px] text-[#7c2d12] text-[0.78rem] font-bold tracking-[0.18em] uppercase";

  return (
    <section className="flex flex-col gap-5 p-6 border border-[rgba(109,83,56,0.16)] rounded-[28px] bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(245,234,217,0.92))] [box-shadow:var(--shadow-panel)] backdrop-blur-[10px] max-sm:p-[18px] max-sm:rounded-[22px]">
      <div className="flex justify-between gap-5 items-stretch max-lg:flex-col max-lg:items-stretch">
        <div>
          <p className={eyebrow}>Goal log</p>
          <h3 className="max-w-[680px] font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">
            Capture shared goals with a clear date range before bringing them
            into weekly review.
          </h3>
        </div>

        <div className="min-w-[220px] p-[18px] rounded-[22px] bg-[linear-gradient(180deg,#fff3e3,#f6dfc8)] text-[#7c2d12]">
          <span className="block mb-2 text-[0.8rem] font-bold tracking-[0.08em] uppercase">Goal setup</span>
          <strong className="block mb-2 text-[1.35rem]">Time-boxed goals</strong>
          <p className="text-[#8a7461]">
            Each goal now has a start date, end date, and status instead of a
            fixed cadence field.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <section className="flex flex-col gap-[18px] p-[22px] border border-[rgba(109,83,56,0.16)] rounded-[24px] bg-[#fff9f1] max-sm:p-[18px] max-sm:rounded-[22px]">
          <div className="flex justify-between items-start gap-4 max-lg:flex-col max-lg:items-stretch">
            <div>
              <p className={eyebrow}>Saved goals</p>
              <h4 className="font-[600] text-[1.55rem] leading-[1.05] [font-family:var(--font-sans)] text-[#1f1711]">Current goals in this relationship</h4>
            </div>
            <span className="inline-flex items-center justify-center px-3 py-[7px] rounded-full bg-[#fff1de] text-[#7c2d12] text-[0.86rem] font-bold">
              {goals.length} total
            </span>
          </div>

          <div className="grid gap-[14px]">
            {goals.length === 0 ? (
              <p className="p-[18px] rounded-[18px] border border-dashed border-[rgba(109,83,56,0.24)] bg-[rgba(255,250,244,0.76)] text-[#8a7461]">
                No goals yet. Add one to start building your shared roadmap.
              </p>
            ) : (
              goals.map((goal, index) => (
                <article
                  className="flex flex-col gap-3 p-[18px] border border-[rgba(109,83,56,0.16)] rounded-[20px] bg-[linear-gradient(180deg,#fffdfa,#fcf2e7)]"
                  key={`${goal.title}-${index}`}
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
      </div>
    </section>
  );
}
