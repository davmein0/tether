import TimelineBoard from "../components/TimelineBoard";

type Props = {
  relationshipId: string;
};

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";

export default function TimelinePage({ relationshipId }: Props) {
  return (
    <section className="bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-5 p-6">
      <div className="flex justify-between gap-5 items-stretch">
        <div>
          <p className={eyebrow}>Timeline</p>
          <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
            Track reachouts, meetings, and daily progress in one running view of support.
          </h3>
        </div>

        <div className="min-w-[220px] p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col gap-2">
          <span className={eyebrow}>Timeline types</span>
          <strong className="text-stone-800 text-lg font-semibold">Reachouts, meetings, metrics</strong>
          <p className="text-stone-600 text-sm leading-relaxed">Every key moment now gets its own place instead of being nested in the dashboard.</p>
        </div>
      </div>

      <TimelineBoard relationshipId={relationshipId} />
    </section>
  );
}
