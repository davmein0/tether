import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Goal, CustomStrategyRecord } from "../types";
import "./GoalReviewForm.css";
import "./GoalReviewForm.css";

type Props = {
  relationshipId: string;
  userId: string;
  goals: (Goal & { id: string })[];
  strategies: CustomStrategyRecord[];
};

export default function GoalReviewForm({
  relationshipId,
  userId,
  goals,
  strategies,
}: Props) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [rating, setRating] = useState<number>(3);
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatDidntWork, setWhatDidntWork] = useState("");
  const [howToProgress, setHowToProgress] = useState("");
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleStrategy = (strategyId: string) => {
    setSelectedStrategies((prev) =>
      prev.includes(strategyId)
        ? prev.filter((id) => id !== strategyId)
        : [...prev, strategyId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedGoalId ||
      !whatWentWell.trim() ||
      !whatDidntWork.trim() ||
      !howToProgress.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "goalReviews"), {
        relationshipId,
        goalId: selectedGoalId,
        reviewedBy: userId,
        rating,
        whatWentWell: whatWentWell.trim(),
        whatDidntWork: whatDidntWork.trim(),
        howToProgressForward: howToProgress.trim(),
        workingStrategies: selectedStrategies,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Reset form
      setSelectedGoalId("");
      setRating(3);
      setWhatWentWell("");
      setWhatDidntWork("");
      setHowToProgress("");
      setSelectedStrategies([]);
    } catch (error) {
      console.error("Error creating review:", error);
      alert("Failed to create review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (goals.length === 0) {
    return (
      <div className="review-empty">
        <p>No goals yet. Create goals first to start tracking progress.</p>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label className="form-label">
          Which goal would you like to review?
        </label>
        <select
          className="form-select"
          value={selectedGoalId}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          required
        >
          <option value="">-- Select a goal --</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label className="form-label">
          How would you rate progress? (1-5 stars)
        </label>
        <div className="rating-selector">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`star-button ${rating >= star ? "active" : ""}`}
              onClick={() => setRating(star)}
              type="button"
              title={`${star} star${star !== 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
          <span className="rating-label">{rating}/5</span>
        </div>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="went-well">
          What went well?
        </label>
        <textarea
          id="went-well"
          className="form-textarea"
          placeholder="What progress did you make? What did you do right?"
          value={whatWentWell}
          onChange={(e) => setWhatWentWell(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="didnt-work">
          What didn't work?
        </label>
        <textarea
          id="didnt-work"
          className="form-textarea"
          placeholder="What challenges did you face? What didn't go as planned?"
          value={whatDidntWork}
          onChange={(e) => setWhatDidntWork(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="how-progress">
          How can we progress forward?
        </label>
        <textarea
          id="how-progress"
          className="form-textarea"
          placeholder="What's the next step? How should we adjust our approach?"
          value={howToProgress}
          onChange={(e) => setHowToProgress(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      {strategies.length > 0 && (
        <div className="form-section">
          <label className="form-label">
            Which strategies are working well?
          </label>
          <div className="strategy-checklist">
            {strategies.map((strategy) => (
              <label key={strategy.id} className="strategy-checkbox">
                <input
                  type="checkbox"
                  checked={selectedStrategies.includes(strategy.id)}
                  onChange={() => toggleStrategy(strategy.id)}
                  disabled={isSubmitting}
                />
                <span className="strategy-name">{strategy.name}</span>
                {strategy.description && (
                  <span className="strategy-description">
                    {strategy.description}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        className="form-submit"
        type="submit"
        disabled={isSubmitting || !selectedGoalId}
      >
        {isSubmitting ? "Saving review..." : "Save review"}
      </button>
    </form>
  );
}
