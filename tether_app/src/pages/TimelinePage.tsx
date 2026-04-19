import TimelineBoard from "../components/TimelineBoard";
import WeeklyTimeline from "../components/WeeklyTimeline";

type Props = {
  relationshipId: string;
};

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";

export default function TimelinePage({ relationshipId }: Props) {
  return (
    <section className="bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-6 p-6">
      <div className="flex justify-between gap-5 items-start max-lg:flex-col">
        <div>
          <p className={eyebrow}>Timeline</p>
          <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
            A week-by-week record of every goal, reachout, and check-in.
          </h3>
        </div>
        <div className="flex gap-3 shrink-0 flex-wrap">
          {[
            { dot: "bg-emerald-500", label: "Goal started" },
            { dot: "bg-teal-500", label: "Reachout" },
            { dot: "bg-amber-500", label: "Meeting" },
            { dot: "bg-stone-400", label: "Metric" },
          ].map(({ dot, label }) => (
            <span className="flex items-center gap-1.5 text-xs text-stone-500" key={label}>
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <WeeklyTimeline relationshipId={relationshipId} />

      <div className="border-t border-stone-100 pt-5">
        <p className={eyebrow + " mb-3"}>Log manually</p>
        <TimelineBoard relationshipId={relationshipId} showHeader={false} />
      </div>
    </section>
  );
}
