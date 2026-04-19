import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import GoalsBoard from "../components/GoalsBoard";
import useGoals from "../hooks/useGoals";
import { auth, db } from "../services/firebase";

type Props = {
  relationshipId: string;
};

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

    await addDoc(collection(db, "goals"), {
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
    });

    resetForm();
    setIsAddingGoal(false);
  };

  const eyebrow =
    "mb-[10px] text-[#7c2d12] text-[0.78rem] font-bold tracking-[0.18em] uppercase";

  const primaryButton =
    "border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#b45309,#7c2d12)] text-[#fff9f1] font-bold transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)] disabled:cursor-wait disabled:opacity-70 disabled:translate-y-0 disabled:[box-shadow:none]";

  const navPill =
    "border border-[rgba(109,83,56,0.16)] rounded-full px-[18px] py-3 font-bold text-[0.88rem] bg-[rgba(255,249,241,0.8)] text-[#7c2d12] [box-shadow:none] transition-transform duration-[140ms] hover:translate-y-[-1px]";

  const inputCls =
    "w-full min-h-[46px] p-[11px_14px] border border-[rgba(109,83,56,0.2)] rounded-[16px] bg-[#fffdfa] text-[#1f1711]";

  return (
    <section className="flex flex-col gap-5 p-6 border border-[rgba(109,83,56,0.16)] rounded-[28px] bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(245,234,217,0.92))] [box-shadow:var(--shadow-panel)] backdrop-blur-[10px] max-sm:p-[18px] max-sm:rounded-[22px]">
      <div className="flex justify-between gap-5 items-stretch max-lg:flex-col max-lg:items-stretch">
        <div>
          <p className={eyebrow}>Goals</p>
          <h3 className="max-w-[680px] font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">
            Keep this page focused on a small, active set of shared goals.
          </h3>
        </div>

        <div className="min-w-[220px] p-[18px] rounded-[22px] bg-[linear-gradient(180deg,#fff3e3,#f6dfc8)] text-[#7c2d12]">
          <span className="block mb-2 text-[0.8rem] font-bold tracking-[0.08em] uppercase">Goal limit</span>
          <strong className="block mb-2 text-[1.35rem]">1 to 5 goals</strong>
          <p className="text-[#8a7461]">
            The list works best when it stays tight enough to guide action instead of becoming a
            backlog.
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-[18px] p-[22px] border border-[rgba(109,83,56,0.16)] rounded-[24px] bg-[#fff9f1] max-sm:p-[18px] max-sm:rounded-[22px]">
        <div className="flex justify-between items-start gap-4 max-lg:flex-col max-lg:items-stretch">
          <div>
            <p className={eyebrow}>Goal list</p>
            <h4 className="font-[600] text-[1.55rem] leading-[1.05] [font-family:var(--font-sans)] text-[#1f1711]">Current goals in this relationship</h4>
          </div>
          <button
            className={primaryButton}
            disabled={maxGoalsReached}
            onClick={() => setIsAddingGoal((currentValue) => !currentValue)}
            type="button"
          >
            {isAddingGoal ? "Hide goal form" : "Add a goal"}
          </button>
        </div>

        <p className="text-[#8a7461]">
          {maxGoalsReached
            ? "You already have 5 goals in the list. Complete or pause one before adding another."
            : `You currently have ${goals.length} goal${goals.length === 1 ? "" : "s"} in the list.`}
        </p>

        {isAddingGoal ? (
          <div className="grid grid-cols-2 gap-[14px] max-lg:grid-cols-1">
            <label className="flex flex-col gap-2 text-[#1f1711] font-bold">
              <span>Goal title</span>
              <input className={inputCls} onChange={(event) => setTitle(event.target.value)} value={title} />
            </label>

            <label className="flex flex-col gap-2 text-[#1f1711] font-bold">
              <span>Status</span>
              <input className={inputCls} onChange={(event) => setStatus(event.target.value)} value={status} />
            </label>

            <label className="flex flex-col gap-2 text-[#1f1711] font-bold col-span-full max-lg:col-span-1">
              <span>Description</span>
              <textarea
                className="w-full min-h-[110px] resize-y p-[14px_16px] border border-[rgba(109,83,56,0.2)] rounded-[18px] bg-[#fffdfa] text-[#1f1711]"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </label>

            <label className="flex flex-col gap-2 text-[#1f1711] font-bold">
              <span>Target</span>
              <input
                className={inputCls}
                onChange={(event) => setTargetLabel(event.target.value)}
                placeholder="Ex: 4 calm morning starts"
                value={targetLabel}
              />
            </label>

            <label className="flex flex-col gap-2 text-[#1f1711] font-bold">
              <span>Start date</span>
              <input
                className={inputCls}
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                value={startDate}
              />
            </label>

            <label className="flex flex-col gap-2 text-[#1f1711] font-bold">
              <span>End date</span>
              <input
                className={inputCls}
                onChange={(event) => setEndDate(event.target.value)}
                type="date"
                value={endDate}
              />
            </label>

            <div className="flex gap-3 flex-wrap col-span-full max-lg:col-span-1">
              <button className={primaryButton} onClick={saveGoal} type="button">
                Save goal
              </button>
              <button
                className={navPill}
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
