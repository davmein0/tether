export type Mood = "stress" | "bored" | "habit" | "other";

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
