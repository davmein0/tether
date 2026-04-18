export type Mood = "stress" | "bored" | "habit" | "other";

export interface Event {
  relationshipId: string;
  createdBy: string; // userId (IMPORTANT ADDITION)
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

export interface User {
  id: string;

  displayName: string;
  email: string;
  photoURL?: string;

  relationshipId?: string; // KEY ADDITION

  createdAt: any;
}

export interface Relationship {
  id: string;

  userA: string; // userId
  userB: string; // userId

  createdAt: any;

  status: "active" | "paused";
}
