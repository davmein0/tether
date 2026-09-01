import { describe, expect, it } from "vitest";
import { getResponseSuggestions, getSuggestedResponse } from "./api";
import type { Mood } from "../types";

const moods: Mood[] = ["stress", "bored", "habit"];

describe("getResponseSuggestions", () => {
  it("returns a distinct set of suggestions per mood", () => {
    const firsts = moods.map((mood) => getResponseSuggestions(mood)[0]);
    expect(new Set(firsts).size).toBe(moods.length);
  });

  it("falls back to generic suggestions for an unknown mood", () => {
    expect(getResponseSuggestions(undefined).length).toBeGreaterThan(0);
  });

  it("never returns an empty list", () => {
    for (const mood of [...moods, undefined]) {
      expect(getResponseSuggestions(mood).every((s) => s.trim().length > 0)).toBe(true);
    }
  });
});

describe("getSuggestedResponse", () => {
  it("returns the first suggestion for the mood", () => {
    for (const mood of moods) {
      expect(getSuggestedResponse(mood)).toBe(getResponseSuggestions(mood)[0]);
    }
  });
});
