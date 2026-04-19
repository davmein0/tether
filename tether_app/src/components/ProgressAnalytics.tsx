import { Timestamp } from "firebase/firestore";
import type { GoalReviewRecord, Goal, CustomStrategyRecord } from "../types";
import "./ProgressAnalytics.css";
import "./ProgressAnalytics.css";

type Props = {
  relationshipId: string;
  reviews: GoalReviewRecord[];
  goals: (Goal & { id: string })[];
  strategies: CustomStrategyRecord[];
};

interface GoalStats {
  goalId: string;
  goalTitle: string;
  reviews: GoalReviewRecord[];
  avgRating: number;
  trend: "improving" | "stable" | "declining";
  topStrategies: string[];
  recommendation: string;
}

function calculateGoalStats(
  goalId: string,
  goalTitle: string,
  reviews: GoalReviewRecord[],
  strategies: CustomStrategyRecord[],
): GoalStats {
  const goalReviews = reviews.filter((r) => r.goalId === goalId);

  if (goalReviews.length === 0) {
    return {
      goalId,
      goalTitle,
      reviews: [],
      avgRating: 0,
      trend: "stable",
      topStrategies: [],
      recommendation: "No reviews yet. Start by creating your first review.",
    };
  }

  const ratings = goalReviews.map((r) => r.rating);
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  // Determine trend
  let trend: "improving" | "stable" | "declining" = "stable";
  if (goalReviews.length >= 2) {
    const recent = ratings.slice(-2);
    if (recent[1] > recent[0] + 0.5) trend = "improving";
    else if (recent[1] < recent[0] - 0.5) trend = "declining";
  }

  // Find most used strategies
  const strategyFreq = new Map<string, number>();
  goalReviews.forEach((review) => {
    review.workingStrategies?.forEach((stratId) => {
      strategyFreq.set(stratId, (strategyFreq.get(stratId) || 0) + 1);
    });
  });

  const topStrategyIds = [...strategyFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  const topStrategies = topStrategyIds
    .map((id) => strategies.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[];

  // Generate recommendation
  let recommendation = "";
  if (avgRating >= 4) {
    recommendation = `Excellent progress! You're averaging ${avgRating.toFixed(1)}/5 stars. Keep using these strategies and consider setting new goals.`;
  } else if (avgRating >= 3) {
    recommendation = `Good progress at ${avgRating.toFixed(1)}/5 stars. The strategies you're using are working—keep refining your approach and celebrate small wins.`;
  } else if (avgRating >= 2) {
    recommendation = `You're at ${avgRating.toFixed(1)}/5 stars. Consider trying new strategies or adjusting your current ones. What's one small thing you could change this week?`;
  } else {
    recommendation = `This goal needs fresh thinking. Review what isn't working and consider trying a completely different strategy or breaking the goal into smaller steps.`;
  }

  if (trend === "improving") {
    recommendation += " Things are getting better—momentum is on your side!";
  } else if (trend === "declining") {
    recommendation +=
      " The trend is downward. Check in on what's changed recently.";
  }

  return {
    goalId,
    goalTitle,
    reviews: goalReviews,
    avgRating,
    trend,
    topStrategies,
    recommendation,
  };
}

export default function ProgressAnalytics({
  reviews,
  goals,
  strategies,
}: Props) {
  const stats = goals.map((goal) =>
    calculateGoalStats(goal.id, goal.title, reviews, strategies),
  );

  const overallAvg =
    stats.length > 0
      ? stats.reduce((sum, s) => sum + s.avgRating, 0) / stats.length
      : 0;

  const improvingGoals = stats.filter((s) => s.trend === "improving").length;
  const decliningGoals = stats.filter((s) => s.trend === "declining").length;

  return (
    <div className="analytics-container">
      <div className="analytics-summary">
        <div className="summary-card">
          <p className="summary-label">Overall Progress</p>
          <p className="summary-value">{overallAvg.toFixed(1)}/5</p>
          <p className="summary-subtext">
            {stats.length} goal{stats.length !== 1 ? "s" : ""} reviewed
          </p>
        </div>

        <div className="summary-card">
          <p className="summary-label">Improving</p>
          <p className="summary-value">{improvingGoals}</p>
          <p className="summary-subtext">Goals trending up</p>
        </div>

        <div className="summary-card">
          <p className="summary-label">Attention Needed</p>
          <p className="summary-value">{decliningGoals}</p>
          <p className="summary-subtext">Goals trending down</p>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="no-data">
          <p>
            No reviews yet. Create reviews to see analytics and recommendations.
          </p>
        </div>
      ) : (
        <div className="goals-analytics">
          {stats.map((stat) => (
            <div className="goal-analytics-card" key={stat.goalId}>
              <div className="card-header">
                <h4 className="card-title">{stat.goalTitle}</h4>
                <div className="card-badge" data-trend={stat.trend}>
                  {stat.trend === "improving"
                    ? "📈 Improving"
                    : stat.trend === "declining"
                      ? "📉 Declining"
                      : "→ Stable"}
                </div>
              </div>

              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-label">Avg Rating</span>
                  <span className="stat-value">
                    {stat.avgRating.toFixed(1)}/5
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Reviews</span>
                  <span className="stat-value">{stat.reviews.length}</span>
                </div>
              </div>

              {stat.topStrategies.length > 0 && (
                <div className="card-section">
                  <h5 className="section-title">Top Working Strategies</h5>
                  <div className="strategy-list">
                    {stat.topStrategies.map((name) => (
                      <span key={name} className="strategy-badge">
                        ✓ {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="card-section">
                <h5 className="section-title">💡 Recommendation</h5>
                <p className="recommendation-text">{stat.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
