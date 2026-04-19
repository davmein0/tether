import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import GoalsBoard from "../components/GoalsBoard";
import useGoals from "../hooks/useGoals";
import { auth, db } from "../services/firebase";

type Props = {
  relationshipId: string;
};

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";
const inputCls = "w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none";

export default function GoalsPage({ relationshipId }: Props) {
  const goals = useGoals(relationshipId);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetLabel, setTargetLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");

  const maxGoalsReached = goals.length >= 5;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTargetLabel("");
    setStartDate("");
    setEndDate("");
    setStatus("active");
  };

  const saveGoal = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedTarget = targetLabel.trim();

    if (
      maxGoalsReached ||
      !trimmedTitle ||
      !trimmedDescription ||
      !trimmedTarget ||
      !startDate ||
      !endDate
    ) {
      return;
    }

    await Promise.all([
      addDoc(collection(db, "goals"), {
        relationshipId,
        title: trimmedTitle,
        description: trimmedDescription,
        targetLabel: trimmedTarget,
        startDate,
        endDate,
        status,
        createdBy: auth.currentUser?.uid ?? "unknown",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      addDoc(collection(db, "timelineEntries"), {
        relationshipId,
        type: "goal",
        title: `Goal started: ${trimmedTitle}`,
        detail: trimmedDescription,
        createdAt: serverTimestamp(),
      }),
    ]);

    resetForm();
    setIsAddingGoal(false);
  };

  return (
    <section className="bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-5 p-6">
      <div className="flex justify-between gap-5 items-stretch">
        <div>
          <p className={eyebrow}>Goals</p>
          <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
            Keep this page focused on a small, active set of shared goals.
          </h3>
        </div>

        <div className="min-w-[220px] p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700">Goal limit</span>
          <strong className="text-stone-800 text-lg font-semibold">1 to 5 goals</strong>
          <p className="text-stone-600 text-sm leading-relaxed">
            The list works best when it stays tight enough to guide action instead of becoming a
            backlog.
          </p>
        </div>
      </div>

      <section className="bg-stone-50 rounded-2xl border border-stone-100 flex flex-col gap-4 p-5">
        <div className="flex justify-between items-center gap-4 mb-4">
          <div>
            <p className={eyebrow}>Goal list</p>
            <h4 className="text-lg font-semibold text-stone-800">Current goals in this relationship</h4>
          </div>
          <button
            className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0"
            disabled={maxGoalsReached}
            onClick={() => setIsAddingGoal((currentValue) => !currentValue)}
            type="button"
          >
            {isAddingGoal ? "Hide goal form" : "Add a goal"}
          </button>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed">
          {maxGoalsReached
            ? "You already have 5 goals in the list. Complete or pause one before adding another."
            : `You currently have ${goals.length} goal${goals.length === 1 ? "" : "s"} in the list.`}
        </p>

        {isAddingGoal ? (
          <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-800">
              <span>Goal title</span>
              <input className={inputCls} onChange={(event) => setTitle(event.target.value)} value={title} />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-800">
              <span>Status</span>
              <input className={inputCls} onChange={(event) => setStatus(event.target.value)} value={status} />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-800 col-span-2 max-lg:col-span-1">
              <span>Description</span>
              <textarea
                className={inputCls}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                value={description}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-800">
              <span>Target</span>
              <input
                className={inputCls}
                onChange={(event) => setTargetLabel(event.target.value)}
                placeholder="Ex: 4 calm morning starts"
                value={targetLabel}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-800">
              <span>Start date</span>
              <input
                className={inputCls}
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                value={startDate}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-800">
              <span>End date</span>
              <input
                className={inputCls}
                onChange={(event) => setEndDate(event.target.value)}
                type="date"
                value={endDate}
              />
            </label>

            <div className="flex gap-3 flex-wrap col-span-2 max-lg:col-span-1">
              <button
                className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0"
                onClick={saveGoal}
                type="button"
              >
                Save goal
              </button>
              <button
                className="bg-white hover:bg-stone-50 text-stone-600 rounded-full px-4 py-2 text-sm font-medium border border-stone-200 transition-colors"
                onClick={() => {
                  resetForm();
                  setIsAddingGoal(false);
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <GoalsBoard limit={5} relationshipId={relationshipId} showHeader={false} />
      </section>
    </section>
  );
}
