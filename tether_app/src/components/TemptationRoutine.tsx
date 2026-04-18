import { useState } from "react";
import type { RoutineStep } from "../types";

const steps: RoutineStep[] = [
  {
    id: "pause",
    label: "Pause and breathe",
    detail: "Stop what you're doing. Take 5 slow, deep breaths before anything else.",
  },
  {
    id: "name",
    label: "Name the trigger",
    detail: "What's setting this off? Say it out loud or write it down — even one word.",
  },
  {
    id: "delay",
    label: "Wait 10 minutes",
    detail: "The urge will peak and pass. Set a timer and commit to waiting it out.",
  },
  {
    id: "connect",
    label: "Reach out to your mentor",
    detail: "Your supporter is here. Send them a message or use the struggle button above.",
  },
];

type Props = {
  onDismiss: () => void;
};

export default function TemptationRoutine({ onDismiss }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = Math.round((checked.size / steps.length) * 100);
  const allDone = checked.size === steps.length;

  return (
    <div className="routine-panel">
      <div className="routine-header">
        <div>
          <p className="eyebrow">Temptation routine</p>
          <h5>Work through this before you act</h5>
        </div>
        <button
          aria-label="Dismiss routine"
          className="routine-dismiss"
          onClick={onDismiss}
          type="button"
        >
          ✕
        </button>
      </div>

      <div className="routine-progress-track">
        <div className="routine-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="routine-progress-label">
        {checked.size} of {steps.length} steps completed
      </p>

      <ol className="routine-steps">
        {steps.map((step) => {
          const done = checked.has(step.id);
          return (
            <li className={`routine-step${done ? " routine-step-done" : ""}`} key={step.id}>
              <button
                aria-pressed={done}
                className="routine-check"
                onClick={() => toggle(step.id)}
                type="button"
              >
                {done ? "✓" : ""}
              </button>
              <div className="routine-step-body">
                <p className="routine-step-label">{step.label}</p>
                <p className="routine-step-detail">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {allDone && (
        <div className="routine-complete">
          <strong>You made it through.</strong>
          <p>Great work resisting that urge. Your supporter has been notified.</p>
          <button className="primary-button" onClick={onDismiss} type="button">
            Close routine
          </button>
        </div>
      )}
    </div>
  );
}
