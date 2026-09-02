import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/firestore.rules.test.ts"],
    // The emulator is shared state; parallel files would clear each other's data.
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
