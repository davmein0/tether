export type Mood = "stress" | "bored" | "habit" | "other";

export interface Event {
  relationshipId: string;
  type: "struggle" | "checkin";
  mood?: Mood;
  note?: string;
  createdAt?: any;
}

export interface Message {
  relationshipId: string;
  senderId: string;
  text: string;
  createdAt?: any;
}

export interface Users {
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Relationship {
  name: string;
  doerId: string;
  supporterId: string | null;
  status: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Goal {
  title: string;
  description: string;
  targetLabel: string;
  startDay: string;
  endDay: string | null;
  status: string;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
