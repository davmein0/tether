export type UserRole = "doer" | "supporter";
export type Mood = "stress" | "bored" | "habit" | "other";
export type TimelineEntryType = "reachout" | "meeting" | "metric";

export interface AppUser {
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole | string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Relationship {
  name: string;
  doerId: string | null;
  supporterId: string | null;
  status: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RelationshipRecord extends Relationship {
  id: string;
}

export interface Invite {
  relationshipId: string;
  createdBy: string;
  createdByRole: UserRole;
  targetRole: UserRole;
  code: string;
  status: string;
  claimedBy: string | null;
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
