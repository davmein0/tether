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
    <section className="card">
      {showHeader ? (
        <div className="section-heading">
          <div>
            <p className="eyebrow">Progress timeline</p>
            <h4>How this week has unfolded</h4>
          </div>
        </div>
      ) : null}

      <div className="timeline">
        {timelineEntries.length === 0 ? (
          <p className="empty-state">
            Timeline activity will appear here once you log a reachout, meeting, or metric.
          </p>
        ) : (
          timelineEntries.map((entry, index) => (
            <article className="timeline-item" key={`${entry.title}-${index}`}>
              <div className={`timeline-marker timeline-marker-${getEntryTone(entry.type)}`}>
                {getEntryLabel(entry.type)}
              </div>
              <div className="timeline-content">
                <div className="timeline-meta">
                  <span>{formatTimelineDate(entry.createdAt)}</span>
                  {entry.metricValue !== undefined && entry.metricLabel ? (
                    <span>
                      {entry.metricLabel}: {entry.metricValue}
                    </span>
                  ) : null}
                </div>
                <h5>{entry.title}</h5>
                <p>{entry.detail}</p>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="timeline-loggers">
        <div className="timeline-logger">
          <label className="support-label" htmlFor="meeting-summary">
            Log a meeting
          </label>
          <textarea
            id="meeting-summary"
            className="support-textarea"
            onChange={(event) => setMeetingSummary(event.target.value)}
            placeholder="Capture what came out of a check-in or support meeting..."
            value={meetingSummary}
          />
          <button className="secondary-button" onClick={logMeeting} type="button">
            Save meeting
          </button>
        </div>

        <div className="timeline-logger">
          <label className="support-label" htmlFor="metric-name">
            Log a daily metric
          </label>
          <input
            id="metric-name"
            onChange={(event) => setMetricName(event.target.value)}
            placeholder="Metric name"
            type="text"
            value={metricName}
          />
          <input
            onChange={(event) => setMetricValue(event.target.value)}
            placeholder="Metric value"
            type="number"
            value={metricValue}
          />
          <button className="secondary-button" onClick={logMetric} type="button">
            Save metric
          </button>
        </div>
      </div>
    </section>
  );
}
