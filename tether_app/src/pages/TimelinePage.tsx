import TimelineBoard from "../components/TimelineBoard";

type Props = {
  relationshipId: string;
};

export default function TimelinePage({ relationshipId }: Props) {
  const eyebrow =
    "mb-[10px] text-[#7c2d12] text-[0.78rem] font-bold tracking-[0.18em] uppercase";

  return (
    <section className="flex flex-col gap-5 p-6 border border-[rgba(109,83,56,0.16)] rounded-[28px] bg-[linear-gradient(180deg,rgba(249,252,248,0.98),rgba(231,242,236,0.92))] [box-shadow:var(--shadow-panel)] backdrop-blur-[10px] max-sm:p-[18px] max-sm:rounded-[22px]">
      <div className="flex justify-between gap-5 items-stretch max-lg:flex-col max-lg:items-stretch">
        <div>
          <p className={eyebrow}>Timeline</p>
          <h3 className="max-w-[680px] font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">
            Track reachouts, meetings, and daily progress in one running view of support.
          </h3>
        </div>

        <div className="min-w-[220px] p-[18px] rounded-[22px] bg-[linear-gradient(180deg,#fff3e3,#f6dfc8)] text-[#7c2d12]">
          <span className="block mb-2 text-[0.8rem] font-bold tracking-[0.08em] uppercase">Timeline types</span>
          <strong className="block mb-2 text-[1.35rem]">Reachouts, meetings, metrics</strong>
          <p className="text-[#8a7461]">Every key moment now gets its own place instead of being nested in the dashboard.</p>
        </div>
      </div>

      <TimelineBoard relationshipId={relationshipId} />
    </section>
  );
}
