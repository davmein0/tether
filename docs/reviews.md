# Reviews and strategies

The Reviews page (`pages/Reviews.tsx`, reachable at `#reviews`) is where a pair looks back at a goal instead of just logging activity on it. It has three tabs: **Goal Reviews**, **Strategies**, and **Analytics**.

## Goal reviews

A review is a structured reflection on one goal: a 1–5 star rating, what went well, what didn't, how to move forward, and which strategies were actually working. Either person can write one, and both can read them.

```typescript
// goalReviews/{reviewId}
interface GoalReview {
  relationshipId: string;
  goalId: string;
  reviewedBy: string;
  rating: number;              // 1-5
  whatWentWell: string;
  whatDidntWork: string;
  howToProgressForward: string;
  workingStrategies: string[]; // customStrategies ids
  suggestedStrategies?: string[];
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Custom strategies

Strategies are the pair's own coping and accountability tactics, replacing what used to be a hardcoded temptation routine. They are categorised (`coping`, `motivation`, `accountability`, `celebration`, `other`), managed in the Strategies tab, and referenced from reviews so their effectiveness can be tracked.

```typescript
// customStrategies/{strategyId}
interface CustomStrategy {
  relationshipId: string;
  name: string;
  description: string;
  category: "coping" | "motivation" | "accountability" | "celebration" | "other";
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Analytics

`components/ProgressAnalytics.tsx` derives everything client-side from the reviews above — there is no model or service behind it. Per goal it computes the average rating, a trend (improving / stable / declining) from the rating sequence, and the most frequently selected strategies. The recommendation is a lookup on the average rating, adjusted by the trend:

| Average rating | Suggestion |
| --- | --- |
| 4+ | Celebrate the win, consider stretching the goal |
| 3–4 | Refine the current approach |
| 2–3 | Try different strategies |
| < 2 | The approach itself needs rethinking |

## Access

Authorization for `goalReviews` and `customStrategies` lives in `firestore.rules` at the repo root, covered by `npm run test:rules`. Both collections are scoped to relationship membership derived from the relationship document, and records cannot be moved to another relationship. Either member may edit or delete either kind of record — these are shared working notes, unlike journal entries, which only their author can change. Do not add rules for these collections from this document — edit `firestore.rules`.
