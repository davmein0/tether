import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import useTimelineEntries from "../hooks/useTimelineEntries";
import { db } from "../services/firebase";
import type { TimelineEntryType } from "../types";

type Props = {
  relationshipId: string;
  showHeader?: boolean;
};

function getEntryTone(type: TimelineEntryType) {
  if (type === "reachout") return "support";
  if (type === "meeting") return "steady";
  return "win";
}

function getEntryLabel(type: TimelineEntryType) {
  if (type === "reachout") return "Reachout";
  if (type === "meeting") return "Meeting";
  return "Metric";
}

function markerBg(tone: string) {
  if (tone === "support") return "bg-[linear-gradient(180deg,#17867d,#0f766e)]";
  if (tone === "steady") return "bg-[linear-gradient(180deg,#9a6b3c,#7c5230)]";
  return "bg-[linear-gradient(180deg,#4d8b61,#3f7b54)]";
}

function formatTimelineDate(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return "Now";
}

export default function TimelineBoard({ relationshipId, showHeader = true }: Props) {
  const [meetingSummary, setMeetingSummary] = useState("");
  const [metricName, setMetricName] = useState("Focus score");
  const [metricValue, setMetricValue] = useState("7");
  const timelineEntries = useTimelineEntries(relationshipId);

  const logMeeting = async () => {
    const trimmedSummary = meetingSummary.trim();

    if (!trimmedSummary) return;

    await addDoc(collection(db, "timelineEntries"), {
      relationshipId,
      type: "meeting",
      title: "Support meeting",
      detail: trimmedSummary,
      createdAt: serverTimestamp(),
    });

    setMeetingSummary("");
  };

  const logMetric = async () => {
    const trimmedMetricName = metricName.trim();
    const parsedMetricValue = Number(metricValue);

    if (!trimmedMetricName || Number.isNaN(parsedMetricValue)) return;

    await addDoc(collection(db, "timelineEntries"), {
      relationshipId,
      type: "metric",
      title: trimmedMetricName,
      detail: `Daily progress metric recorded at ${parsedMetricValue}.`,
      metricLabel: trimmedMetricName,
      metricValue: parsedMetricValue,
      createdAt: serverTimestamp(),
    });
  };

  const eyebrow =
    "mb-[10px] text-[#7c2d12] text-[0.78rem] font-bold tracking-[0.18em] uppercase";

  const secondaryButton =
    "border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#0f766e,#115e59)] text-[#fff9f1] font-bold transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)]";

  const inputCls =
    "w-full min-h-[46px] p-[11px_14px] border border-[rgba(109,83,56,0.2)] rounded-[16px] bg-[#fffdfa] text-[#1f1711]";

  return (
    <section className="flex flex-col gap-[18px] p-[22px] border border-[rgba(109,83,56,0.16)] rounded-[24px] bg-[#fff9f1] max-sm:p-[18px] max-sm:rounded-[22px]">
      {showHeader ? (
        <div className="flex justify-between items-start gap-4 max-lg:flex-col max-lg:items-stretch">
          <div>
            <p className={eyebrow}>Progress timeline</p>
            <h4 className="font-[600] text-[1.55rem] leading-[1.05] [font-family:var(--font-sans)] text-[#1f1711]">How this week has unfolded</h4>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-[14px]">
        {timelineEntries.length === 0 ? (
          <p className="p-[18px] rounded-[18px] border border-dashed border-[rgba(109,83,56,0.24)] bg-[rgba(255,250,244,0.76)] text-[#8a7461]">
            Timeline activity will appear here once you log a reachout, meeting, or metric.
          </p>
        ) : (
          timelineEntries.map((entry, index) => {
            const tone = getEntryTone(entry.type);
            return (
              <article
                className="grid grid-cols-[58px_minmax(0,1fr)] gap-[14px] items-start"
                key={`${entry.title}-${index}`}
              >
                <div
                  className={`inline-flex items-center justify-center min-h-[58px] rounded-[18px] text-white font-bold ${markerBg(tone)}`}
                >
                  {getEntryLabel(entry.type)}
                </div>
                <div className="p-[14px_16px] border border-[rgba(109,83,56,0.16)] rounded-[18px] bg-[#fffdf9]">
                  <div className="flex flex-wrap gap-3 mb-[6px] text-[#8a7461] text-[0.84rem] font-bold">
                    <span>{formatTimelineDate(entry.createdAt)}</span>
                    {entry.metricValue !== undefined && entry.metricLabel ? (
                      <span>
                        {entry.metricLabel}: {entry.metricValue}
                      </span>
                    ) : null}
                  </div>
                  <h5 className="mb-1 text-[#1f1711] font-[600] text-[1.08rem] leading-[1.2] [font-family:var(--font-ui)]">{entry.title}</h5>
                  <p className="text-[#8a7461]">{entry.detail}</p>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className="flex flex-col gap-[10px] p-4 rounded-[18px] border border-[rgba(109,83,56,0.16)] bg-[#fffcf8]">
          <label className="text-[0.92rem] font-bold text-[#1f1711]" htmlFor="meeting-summary">
            Log a meeting
          </label>
          <textarea
            id="meeting-summary"
            className="w-full min-h-[110px] resize-y p-[14px_16px] border border-[rgba(109,83,56,0.2)] rounded-[18px] bg-[#fffdfa] text-[#1f1711]"
            onChange={(event) => setMeetingSummary(event.target.value)}
            placeholder="Capture what came out of a check-in or support meeting..."
            value={meetingSummary}
          />
          <button className={secondaryButton} onClick={logMeeting} type="button">
            Save meeting
          </button>
        </div>

        <div className="flex flex-col gap-[10px] p-4 rounded-[18px] border border-[rgba(109,83,56,0.16)] bg-[#fffcf8]">
          <label className="text-[0.92rem] font-bold text-[#1f1711]" htmlFor="metric-name">
            Log a daily metric
          </label>
          <input
            id="metric-name"
            className={inputCls}
            onChange={(event) => setMetricName(event.target.value)}
            placeholder="Metric name"
            type="text"
            value={metricName}
          />
          <input
            className={inputCls}
            onChange={(event) => setMetricValue(event.target.value)}
            placeholder="Metric value"
            type="number"
            value={metricValue}
          />
          <button className={secondaryButton} onClick={logMetric} type="button">
            Save metric
          </button>
        </div>
      </div>
    </section>
  );
}
