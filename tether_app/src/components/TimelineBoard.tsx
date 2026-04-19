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

function formatTimelineDate(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return "Now";
}

const markerBase = "inline-flex items-center justify-center min-h-[58px] w-[58px] rounded-2xl text-white font-bold text-xs text-center px-1";
const markerTones: Record<string, string> = {
  support: "bg-teal-700",
  steady: "bg-amber-800",
  win: "bg-emerald-700",
};

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";
const inputCls = "w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none";
const secondaryBtn = "bg-white hover:bg-stone-50 text-stone-600 rounded-full px-4 py-2 text-sm font-medium border border-stone-200 transition-colors self-start";

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

  return (
    <section className="bg-stone-50 rounded-2xl border border-stone-100 flex flex-col gap-5 p-5">
      {showHeader ? (
        <div className="flex justify-between items-center gap-4 mb-4">
          <div>
            <p className={eyebrow}>Progress timeline</p>
            <h4 className="text-lg font-semibold text-stone-800">How this week has unfolded</h4>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3.5">
        {timelineEntries.length === 0 ? (
          <p className="text-stone-400 text-xs p-4 rounded-xl border border-dashed border-stone-200 bg-white">
            Timeline activity will appear here once you log a reachout, meeting, or metric.
          </p>
        ) : (
          timelineEntries.map((entry, index) => (
            <article className="grid grid-cols-[58px_minmax(0,1fr)] gap-3.5 items-start" key={`${entry.title}-${index}`}>
              <div className={`${markerBase} ${markerTones[getEntryTone(entry.type)] ?? "bg-stone-500"}`}>
                {getEntryLabel(entry.type)}
              </div>
              <div className="bg-white border border-stone-100 rounded-2xl px-4 py-3.5">
                <div className="flex flex-wrap gap-3 text-stone-400 text-xs font-semibold mb-2">
                  <span>{formatTimelineDate(entry.createdAt)}</span>
                  {entry.metricValue !== undefined && entry.metricLabel ? (
                    <span>
                      {entry.metricLabel}: {entry.metricValue}
                    </span>
                  ) : null}
                </div>
                <h5 className="text-sm font-semibold text-stone-800 mb-1">{entry.title}</h5>
                <p className="text-stone-600 text-sm leading-relaxed">{entry.detail}</p>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className="flex flex-col gap-3 bg-white border border-stone-100 rounded-2xl p-4">
          <label className="text-sm font-semibold text-stone-800" htmlFor="meeting-summary">
            Log a meeting
          </label>
          <textarea
            id="meeting-summary"
            className={inputCls}
            onChange={(event) => setMeetingSummary(event.target.value)}
            placeholder="Capture what came out of a check-in or support meeting..."
            rows={3}
            value={meetingSummary}
          />
          <button className={secondaryBtn} onClick={logMeeting} type="button">
            Save meeting
          </button>
        </div>

        <div className="flex flex-col gap-3 bg-white border border-stone-100 rounded-2xl p-4">
          <label className="text-sm font-semibold text-stone-800" htmlFor="metric-name">
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
          <button className={secondaryBtn} onClick={logMetric} type="button">
            Save metric
          </button>
        </div>
      </div>
    </section>
  );
}
