import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { toDate, toMillis } from "./timestamps";

describe("toDate", () => {
  it("converts a Firestore Timestamp", () => {
    const date = new Date("2025-03-04T05:06:07Z");
    expect(toDate(Timestamp.fromDate(date))).toEqual(date);
  });

  it("returns null for an unresolved serverTimestamp sentinel or missing value", () => {
    expect(toDate(undefined)).toBeNull();
    expect(toDate(null)).toBeNull();
    expect(toDate({ _methodName: "serverTimestamp" })).toBeNull();
  });
});

describe("toMillis", () => {
  it("orders newest first when used as a sort key", () => {
    const older = Timestamp.fromDate(new Date("2025-01-01T00:00:00Z"));
    const newer = Timestamp.fromDate(new Date("2025-02-01T00:00:00Z"));
    expect(toMillis(newer) - toMillis(older)).toBeGreaterThan(0);
  });

  it("treats a pending write as the oldest value", () => {
    expect(toMillis(undefined)).toBe(0);
  });
});
