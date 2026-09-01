import type { Timestamp } from "firebase/firestore";

export type UserRole = "doer" | "supporter";
export type WithId<T> = T & { id: string };
export type Mood = "stress" | "bored" | "habit" | "other";
export type TimelineEntryType = "reachout" | "meeting" | "metric" | "goal";

export interface AppUser {
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type RelationshipStatus = "pending" | "active" | "ended";

export interface Relationship {
  name: string;
  doerId: string | null;
  supporterId: string | null;
  status: RelationshipStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RelationshipRecord extends Relationship {
  id: string;
}

export type InviteStatus = "pending" | "accepted" | "cancelled";

export interface Invite {
  relationshipId: string;
  createdBy: string;
  createdByRole: UserRole;
  targetRole: UserRole;
  code: string;
  status: InviteStatus;
  claimedBy: string | null;
  expiresAt: Timestamp;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface InviteRecord extends Invite {
  id: string;
}

export interface RoutineStep {
  id: string;
  label: string;
  detail: string;
}

export interface Event {
  relationshipId: string;
  type: "struggle" | "checkin";
  mood?: Mood;
  note?: string;
  createdAt?: unknown;
}

export interface Message {
  relationshipId: string;
  senderId: string;
  text: string;
  createdAt?: unknown;
}

export interface Goal {
  relationshipId: string;
  title: string;
  description: string;
  targetLabel: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TimelineEntry {
  relationshipId: string;
  type: TimelineEntryType;
  title: string;
  detail: string;
  metricValue?: number;
  metricLabel?: string;
  createdAt?: unknown;
}

export interface JournalEntry {
  relationshipId: string;
  userId: string;
  text: string;
  imageUrl?: string;
  createdAt?: unknown;
}

export interface JournalComment {
  entryId: string;
  authorId: string;
  authorName?: string;
  text: string;
  createdAt?: unknown;
}

export interface CustomStrategy {
  relationshipId: string;
  name: string;
  description: string;
  category:
    | "coping"
    | "motivation"
    | "accountability"
    | "celebration"
    | "other";
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CustomStrategyRecord extends CustomStrategy {
  id: string;
}

export interface GoalReview {
  relationshipId: string;
  goalId: string;
  reviewedBy: string;
  rating: number; // 1-5
  whatWentWell: string;
  whatDidntWork: string;
  howToProgressForward: string;
  workingStrategies: string[];
  suggestedStrategies?: string[];
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface GoalReviewRecord extends GoalReview {
  id: string;
}
