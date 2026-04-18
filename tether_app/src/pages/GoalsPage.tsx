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

  return (
    <section className="dashboard-panel dashboard-panel-goals">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Goals</p>
          <h3>Keep this page focused on a small, active set of shared goals.</h3>
        </div>

        <div className="dashboard-highlight">
          <span className="dashboard-highlight-label">Goal limit</span>
          <strong>1 to 5 goals</strong>
          <p>
            The list works best when it stays tight enough to guide action instead of becoming a
            backlog.
          </p>
        </div>
      </div>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Goal list</p>
            <h4>Current goals in this relationship</h4>
          </div>
          <button
            className="primary-button"
            disabled={maxGoalsReached}
            onClick={() => setIsAddingGoal((currentValue) => !currentValue)}
            type="button"
          >
            {isAddingGoal ? "Hide goal form" : "Add a goal"}
          </button>
        </div>

        <p className="connection-copy">
          {maxGoalsReached
            ? "You already have 5 goals in the list. Complete or pause one before adding another."
            : `You currently have ${goals.length} goal${goals.length === 1 ? "" : "s"} in the list.`}
        </p>

        {isAddingGoal ? (
          <div className="form-grid">
            <label className="field">
              <span>Goal title</span>
              <input onChange={(event) => setTitle(event.target.value)} value={title} />
            </label>

            <label className="field">
              <span>Status</span>
              <input onChange={(event) => setStatus(event.target.value)} value={status} />
            </label>

            <label className="field field-full">
              <span>Description</span>
              <textarea
                className="support-textarea"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </label>

            <label className="field">
              <span>Target</span>
              <input
                onChange={(event) => setTargetLabel(event.target.value)}
                placeholder="Ex: 4 calm morning starts"
                value={targetLabel}
              />
            </label>

            <label className="field">
              <span>Start date</span>
              <input
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                value={startDate}
              />
            </label>

            <label className="field">
              <span>End date</span>
              <input
                onChange={(event) => setEndDate(event.target.value)}
                type="date"
                value={endDate}
              />
            </label>

            <div className="goal-form-actions">
              <button className="primary-button" onClick={saveGoal} type="button">
                Save goal
              </button>
              <button
                className="nav-pill"
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
