import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import GoalReviewForm from "../components/GoalReviewForm";
import GoalReviewList from "../components/GoalReviewList";
import ProgressAnalytics from "../components/ProgressAnalytics";
import StrategyManager from "../components/StrategyManager";
import type { Goal, GoalReviewRecord, CustomStrategyRecord } from "../types";

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
  const [goals, setGoals] = useState<(Goal & { id: string })[]>([]);
  const [reviews, setReviews] = useState<GoalReviewRecord[]>([]);
  const [strategies, setStrategies] = useState<CustomStrategyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const goalsQuery = query(
      collection(db, "goals"),
      where("relationshipId", "==", relationshipId),
    );

    const goalsUnsub = onSnapshot(goalsQuery, (snapshot) => {
      const goalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (Goal & { id: string })[];

      const sortedGoals = goalsData.sort((a, b) => {
        const aTime = (a.createdAt as any)?.seconds ?? 0;
        const bTime = (b.createdAt as any)?.seconds ?? 0;
        return bTime - aTime;
      });

      setGoals(sortedGoals);
    });

    return goalsUnsub;
  }, [relationshipId]);

  useEffect(() => {
    const reviewsQuery = query(
      collection(db, "goalReviews"),
      where("relationshipId", "==", relationshipId),
    );

    const reviewsUnsub = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GoalReviewRecord[];

      setReviews(reviewsData);
      setIsLoading(false);
    });

    return reviewsUnsub;
  }, [relationshipId]);

  useEffect(() => {
    const strategiesQuery = query(
      collection(db, "customStrategies"),
      where("relationshipId", "==", relationshipId),
    );

    const strategiesUnsub = onSnapshot(strategiesQuery, (snapshot) => {
      const strategiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CustomStrategyRecord[];

      setStrategies(strategiesData);
    });

    return strategiesUnsub;
  }, [relationshipId]);

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
