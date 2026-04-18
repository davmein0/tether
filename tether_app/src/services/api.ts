import type { Mood } from "../types";

export function getSuggestedResponse(mood?: Mood): string {
  return getResponseSuggestions(mood)[0];
}

export function getResponseSuggestions(mood?: Mood): string[] {
  if (mood === "stress") {
    return [
      "That sounds really tough. What's going on?",
      "I'm right here. Take a breath — what's the biggest thing right now?",
      "You reached out, which takes courage. Tell me more.",
      "Let's slow it down together. What's one small thing you can control right now?",
    ];
  }
  if (mood === "bored") {
    return [
      "Is this boredom or hunger?",
      "Boredom can be sneaky. What would you normally do here?",
      "You noticed it — that's a win. Want to make a quick 5-minute plan?",
      "What's one small thing you could do for the next 10 minutes?",
    ];
  }
  if (mood === "habit") {
    return [
      "You've broken this cycle before. What helped last time?",
      "Habits are strongest when we're on autopilot. What triggered it today?",
      "That urge will peak and pass. Can you wait 10 minutes?",
      "You're aware of it — that's already progress. I'm proud of you for reaching out.",
    ];
  }
  return [
    "You've got this — want to pause for a moment?",
    "I'm right here with you. What do you need right now?",
    "You reached out — that's the hardest part. What's happening?",
    "Let's work through this together. Tell me what's going on.",
  ];
}
