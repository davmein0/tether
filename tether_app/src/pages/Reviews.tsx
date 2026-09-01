import { useState } from "react";
import { collection, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useFirestoreQuery } from "../hooks/useFirestoreQuery";
import ErrorBanner from "../components/ErrorBanner";
import GoalReviewForm from "../components/GoalReviewForm";
import GoalReviewList from "../components/GoalReviewList";
import ProgressAnalytics from "../components/ProgressAnalytics";
import StrategyManager from "../components/StrategyManager";
import type { Goal, GoalReview, CustomStrategy } from "../types";
import { toMillis } from "../lib/timestamps";

type Props = {
  relationshipId: string;
  userId: string;
  userRole: "doer" | "supporter";
};

type Tab = "reviews" | "strategies" | "analytics";

export default function ReviewsPage({
  relationshipId,
  userId,
  userRole,
}: Props) {
  const [tab, setTab] = useState<Tab>("reviews");

  const relationshipScoped = (name: string) =>
    query(collection(db, name), where("relationshipId", "==", relationshipId));

  const goalsState = useFirestoreQuery<Goal>(
    () => relationshipScoped("goals"),
    [relationshipId],
  );
  const reviewsState = useFirestoreQuery<GoalReview>(
    () => relationshipScoped("goalReviews"),
    [relationshipId],
  );
  const strategiesState = useFirestoreQuery<CustomStrategy>(
    () => relationshipScoped("customStrategies"),
    [relationshipId],
  );

  const goals = [...goalsState.items].sort(
    (a, b) => toMillis(b.createdAt) - toMillis(a.createdAt),
  );
  const reviews = reviewsState.items;
  const strategies = strategiesState.items;
  const isLoading = reviewsState.loading;
  const loadError =
    goalsState.error ?? reviewsState.error ?? strategiesState.error;

  const tabButtonClass = (isActive: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-full transition-colors ${
      isActive
        ? "bg-stone-900 text-white"
        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
    }`;

  return (
    <section className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Progress & Growth</p>
        <h2 className="text-3xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
          Review goals and track strategies
        </h2>
        <p className="text-stone-600 mt-2">
          Reflect on progress together, celebrate wins, and plan next steps.
        </p>
      </div>

      <div className="flex gap-2 border-b border-stone-200">
        <button
          className={tabButtonClass(tab === "reviews")}
          onClick={() => setTab("reviews")}
          type="button"
        >
          Goal Reviews
        </button>
        <button
          className={tabButtonClass(tab === "strategies")}
          onClick={() => setTab("strategies")}
          type="button"
        >
          Strategies
        </button>
        <button
          className={tabButtonClass(tab === "analytics")}
          onClick={() => setTab("analytics")}
          type="button"
        >
          Analytics
        </button>
      </div>

      {loadError && (
        <ErrorBanner message="We couldn't load your reviews. Check your connection and reload." />
      )}

      {isLoading ? (
        <p className="text-stone-500">Loading...</p>
      ) : tab === "reviews" ? (
        <div className="flex flex-col gap-6">
          <GoalReviewForm
            relationshipId={relationshipId}
            userId={userId}
            goals={goals}
            strategies={strategies}
          />
          <GoalReviewList
            reviews={reviews}
            goals={goals}
            userId={userId}
            strategies={strategies}
          />
        </div>
      ) : tab === "strategies" ? (
        <StrategyManager
          relationshipId={relationshipId}
          userId={userId}
          userRole={userRole}
          strategies={strategies}
        />
      ) : (
        <ProgressAnalytics
          relationshipId={relationshipId}
          reviews={reviews}
          goals={goals}
          strategies={strategies}
        />
      )}
    </section>
  );
}
