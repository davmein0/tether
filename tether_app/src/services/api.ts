import type { Mood } from "../types";

export function getSuggestedResponse(mood?: Mood): string {
  if (mood === "stress") {
    return "That sounds really tough. What's going on?";
  }
  if (mood === "bored") {
    return "Is this boredom or hunger?";
  }
  return "You've got this—want to pause for a moment?";
}
