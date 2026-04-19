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

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";

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
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <p className={eyebrow}>Temptation routine</p>
          <h5 className="text-sm font-semibold text-stone-800">Work through this before you act</h5>
        </div>
        <button
          aria-label="Dismiss routine"
          className="text-stone-400 hover:text-stone-600 bg-transparent border-0 text-lg leading-none px-2 py-1"
          onClick={onDismiss}
          type="button"
        >
          ✕
        </button>
      </div>

      <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
        <div className="h-1.5 rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-stone-400 text-xs -mt-2">
        {checked.size} of {steps.length} steps completed
      </p>

      <ol className="list-none p-0 m-0 flex flex-col gap-2.5">
        {steps.map((step) => {
          const done = checked.has(step.id);
          return (
            <li
              className={`flex gap-3 items-start p-3 rounded-xl bg-white border border-stone-100${done ? " opacity-50" : ""}`}
              key={step.id}
            >
              <button
                aria-pressed={done}
                className={
                  done
                    ? "w-8 h-8 rounded-full border-2 border-emerald-500 bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
                    : "w-8 h-8 rounded-full border-2 border-stone-200 flex items-center justify-center text-sm font-bold shrink-0 transition-colors bg-transparent"
                }
                onClick={() => toggle(step.id)}
                type="button"
              >
                {done ? "✓" : ""}
              </button>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-stone-800">{step.label}</p>
                <p className="text-stone-600 text-sm leading-relaxed">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {allDone && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 flex flex-col gap-2">
          <strong className="text-sm font-semibold">You made it through.</strong>
          <p className="text-sm leading-relaxed">Great work resisting that urge. Your supporter has been notified.</p>
          <button
            className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0 self-start mt-1"
            onClick={onDismiss}
            type="button"
          >
            Close routine
          </button>
        </div>
      )}
    </div>
  );
}
