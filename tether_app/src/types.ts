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
