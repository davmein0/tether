import { Timestamp } from "firebase/firestore";
import type { GoalReviewRecord, Goal, CustomStrategyRecord } from "../types";
import "./GoalReviewList.css";
import "./GoalReviewList.css";

type Props = {
  reviews: GoalReviewRecord[];
  goals: (Goal & { id: string })[];
  userId: string;
  strategies: CustomStrategyRecord[];
};

function formatDate(createdAt: unknown): string {
  if (!createdAt) return "";
  const date = (createdAt as Timestamp).toDate();
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getGoalTitle(
  goalId: string,
  goals: (Goal & { id: string })[],
): string {
  return goals.find((g) => g.id === goalId)?.title || "Goal";
}

function getStrategyNames(
  strategyIds: string[],
  strategies: CustomStrategyRecord[],
): string[] {
  return strategyIds
    .map((id) => strategies.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[];
}

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default function GoalReviewList({
  reviews,
  goals,
  userId,
  strategies,
}: Props) {
  if (reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <p>No reviews yet. Create a review to start tracking progress.</p>
      </div>
    );
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    const aTime = (a.createdAt as Timestamp)?.seconds ?? 0;
    const bTime = (b.createdAt as Timestamp)?.seconds ?? 0;
    return bTime - aTime;
  });

  return (
    <div className="reviews-list">
      <h3 className="reviews-heading">All Reviews</h3>
      {sortedReviews.map((review) => (
        <article className="review-card" key={review.id}>
          <div className="review-header">
            <div className="review-goal">
              <h4 className="review-title">
                {getGoalTitle(review.goalId, goals)}
              </h4>
              <p className="review-meta">
                {review.reviewedBy === userId
                  ? "You reviewed"
                  : "Review from partner"}{" "}
                • {formatDate(review.createdAt)}
              </p>
            </div>
            <div className="review-rating">{renderStars(review.rating)}</div>
          </div>

          <div className="review-content">
            <div className="review-section">
              <h5 className="section-title">✓ What went well</h5>
              <p className="section-text">{review.whatWentWell}</p>
            </div>

            <div className="review-section">
              <h5 className="section-title">✗ What didn't work</h5>
              <p className="section-text">{review.whatDidntWork}</p>
            </div>

            <div className="review-section">
              <h5 className="section-title">→ How to progress forward</h5>
              <p className="section-text">{review.howToProgressForward}</p>
            </div>

            {review.workingStrategies &&
              review.workingStrategies.length > 0 && (
                <div className="review-section">
                  <h5 className="section-title">Working Strategies</h5>
                  <div className="strategy-tags">
                    {getStrategyNames(review.workingStrategies, strategies).map(
                      (name) => (
                        <span key={name} className="strategy-tag">
                          {name}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        </article>
      ))}
    </div>
  );
}
