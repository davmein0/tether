import { defineConfig } from "vitest/config";

// The rules suite needs a running Firestore emulator, so it is opt-in via
// `npm run test:rules` rather than part of the default unit-test run.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
