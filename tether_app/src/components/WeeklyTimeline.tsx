import { useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import useTimelineEntries from "../hooks/useTimelineEntries";
import type { TimelineEntry } from "../types";

type Props = { relationshipId: string };

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMondayWeek(): Date[] {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDate(createdAt: unknown): Date | null {
  if (!createdAt) return null;
  if (typeof createdAt === "object" && createdAt !== null && "toDate" in createdAt) {
    return (createdAt as Timestamp).toDate();
  }
  return null;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const dotColor: Record<string, string> = {
  goal: "bg-emerald-500",
  reachout: "bg-teal-500",
  meeting: "bg-amber-500",
  metric: "bg-stone-400",
};

const badgeColor: Record<string, string> = {
  goal: "bg-emerald-50 text-emerald-700",
  reachout: "bg-teal-50 text-teal-700",
  meeting: "bg-amber-50 text-amber-700",
  metric: "bg-stone-100 text-stone-600",
};

const typeLabel: Record<string, string> = {
  goal: "Goal",
  reachout: "Reachout",
  meeting: "Meeting",
  metric: "Metric",
};

export default function WeeklyTimeline({ relationshipId }: Props) {
  const entries = useTimelineEntries(relationshipId);
  const weekDays = useMemo(() => getMondayWeek(), []);
  const today = new Date();

  const weekEntries = useMemo(() => {
    return entries
      .map((e) => ({ date: toDate(e.createdAt), entry: e }))
      .filter(({ date }) => date && weekDays.some((d) => isSameDay(d, date!)));
  }, [entries, weekDays]);

  const byDayIndex = useMemo(() => {
    const map = new Map<number, { date: Date; entry: TimelineEntry }[]>();
    weekDays.forEach((_, i) => map.set(i, []));
    weekEntries.forEach(({ date, entry }) => {
      const idx = weekDays.findIndex((d) => isSameDay(d, date!));
      if (idx !== -1) map.get(idx)!.push({ date: date!, entry });
    });
    return map;
  }, [weekEntries, weekDays]);

  const monthRange = (() => {
    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${fmt(weekDays[0])} – ${fmt(weekDays[6])}`;
  })();

  const activeDays = weekDays
    .map((day, i) => ({ day, events: byDayIndex.get(i) ?? [] }))
    .filter((x) => x.events.length > 0)
    .sort((a, b) => b.day.getTime() - a.day.getTime());

  return (
    <div className="flex flex-col gap-5">
      {/* Week strip */}
      <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700">
            This week
          </p>
          <span className="text-xs text-stone-400 font-medium">{monthRange}</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            const events = byDayIndex.get(i) ?? [];
            return (
              <div
                className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 px-1 ${
                  isToday ? "bg-amber-50 ring-1 ring-amber-200" : ""
                }`}
                key={i}
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    isToday ? "text-amber-700" : "text-stone-400"
                  }`}
                >
                  {DAY_ABBR[day.getDay()]}
                </span>
                <span
                  className={`text-sm font-bold ${
                    isToday ? "text-amber-700" : "text-stone-700"
                  }`}
                >
                  {day.getDate()}
                </span>
                <div className="flex flex-wrap justify-center gap-0.5 min-h-[14px]">
                  {events.slice(0, 4).map(({ entry }, j) => (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${dotColor[entry.type] ?? "bg-stone-400"}`}
                      key={j}
                    />
                  ))}
                  {events.length > 4 && (
                    <span className="text-[9px] text-stone-400 font-bold leading-none mt-[1px]">
                      +{events.length - 4}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-stone-100">
          {Object.entries(typeLabel).map(([type, label]) => (
            <span className="flex items-center gap-1.5 text-[10px] text-stone-500" key={type}>
              <span className={`w-2 h-2 rounded-full ${dotColor[type]}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Per-day breakdown */}
      {activeDays.length === 0 ? (
        <p className="text-stone-400 text-xs p-5 rounded-xl border border-dashed border-stone-200 bg-stone-50 text-center">
          No activity this week yet. Events appear here as they happen.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {activeDays.map(({ day, events }) => (
            <div className="flex flex-col gap-2" key={day.toISOString()}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-500 shrink-0">
                  {isSameDay(day, today) ? "Today · " : ""}
                  {day.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-[10px] text-stone-400 shrink-0">
                  {events.length} event{events.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {events
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map(({ entry, date }, j) => (
                    <article
                      className="flex gap-3 items-start bg-white border border-stone-100 rounded-xl px-4 py-3"
                      key={j}
                    >
                      <span
                        className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md mt-0.5 ${
                          badgeColor[entry.type] ?? "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {typeLabel[entry.type] ?? entry.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-800 leading-snug">
                          {entry.title}
                        </p>
                        {entry.detail && (
                          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                            {entry.detail}
                          </p>
                        )}
                        {entry.metricValue !== undefined && entry.metricLabel && (
                          <p className="text-xs font-semibold text-stone-600 mt-1">
                            {entry.metricLabel}: {entry.metricValue}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 shrink-0 pt-0.5">
                        {date.toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
