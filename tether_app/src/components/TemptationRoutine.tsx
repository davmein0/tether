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

  const eyebrow =
    "mb-[10px] text-[#7c2d12] text-[0.78rem] font-bold tracking-[0.18em] uppercase";

  return (
    <div className="flex flex-col gap-[14px] p-5 border border-[rgba(180,83,9,0.25)] rounded-[22px] bg-[linear-gradient(160deg,#fff8ee,#fdefd8)]">
      <div className="flex justify-between items-start gap-3 max-lg:flex-col max-lg:items-stretch">
        <div>
          <p className={eyebrow}>Temptation routine</p>
          <h5 className="font-[600] text-[1.05rem] leading-[1.2] [font-family:var(--font-ui)] text-[#1f1711]">Work through this before you act</h5>
        </div>
        <button
          aria-label="Dismiss routine"
          className="flex-shrink-0 px-[10px] py-[6px] rounded-full bg-[rgba(109,83,56,0.1)] text-[#8a7461] text-[0.8rem] border-0 transition-transform duration-[140ms] hover:translate-y-[-1px]"
          onClick={onDismiss}
          type="button"
        >
          ✕
        </button>
      </div>

      <div className="overflow-hidden h-2 rounded-full bg-[#eed9c1]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#d97706,#f59e0b)] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[0.86rem] font-[600] text-[#8a7461] -mt-[6px]">
        {checked.size} of {steps.length} steps completed
      </p>

      <ol className="list-none p-0 m-0 flex flex-col gap-[10px]">
        {steps.map((step) => {
          const done = checked.has(step.id);
          return (
            <li
              className={`grid grid-cols-[36px_minmax(0,1fr)] gap-3 items-start p-[14px] border border-[rgba(109,83,56,0.16)] rounded-[18px] bg-[#fffdf9] transition-opacity duration-200 ${
                done ? "opacity-55" : "opacity-100"
              }`}
              key={step.id}
            >
              <button
                aria-pressed={done}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full border-2 text-[1rem] font-bold p-0 transition-[background,border-color] duration-[180ms] ${
                  done
                    ? "bg-[#3f7b54] border-[#3f7b54] text-white"
                    : "bg-transparent border-[rgba(180,83,9,0.35)] text-[#3f7b54]"
                }`}
                onClick={() => toggle(step.id)}
                type="button"
              >
                {done ? "✓" : ""}
              </button>
              <div className="flex flex-col gap-[3px]">
                <p className="font-bold text-[#1f1711]">{step.label}</p>
                <p className="text-[0.9rem] text-[#8a7461]">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {allDone && (
        <div className="flex flex-col gap-2 p-4 rounded-[18px] bg-[linear-gradient(160deg,#e8f5ee,#d4eddd)] text-[#3f7b54]">
          <strong className="text-[1.05rem]">You made it through.</strong>
          <p className="text-[#3f7b54] opacity-85">Great work resisting that urge. Your supporter has been notified.</p>
          <button
            className="self-start mt-1 border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#3f7b54,#2d6b42)] text-[#fff9f1] font-bold transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)]"
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
