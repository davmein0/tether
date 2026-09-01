import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const DOER = "doer-uid";
const SUPPORTER = "supporter-uid";
const STRANGER = "stranger-uid";
const RELATIONSHIP_ID = "relationship-1";
const CODE = "ABCD2345";

let testEnv: RulesTestEnvironment;

function asDoer() {
  return testEnv.authenticatedContext(DOER).firestore();
}

function asStranger() {
  return testEnv.authenticatedContext(STRANGER).firestore();
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "tether-rules-test",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      // vitest runs with tether_app as the working directory.
      rules: readFileSync("../firestore.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "relationships", RELATIONSHIP_ID), {
      name: "Doer + supporter",
      doerId: DOER,
      supporterId: SUPPORTER,
      status: "active",
    });
    await setDoc(doc(db, "journalEntries", "entry-1"), {
      relationshipId: RELATIONSHIP_ID,
      userId: DOER,
      text: "hard day",
    });
  });
});

describe("relationship-scoped collections", () => {
  const collections = [
    "goals",
    "timelineEntries",
    "events",
    "goalReviews",
    "customStrategies",
  ];

  it.each(collections)("lets a member read and write %s", async (name) => {
    const db = asDoer();
    await assertSucceeds(
      addDoc(collection(db, name), { relationshipId: RELATIONSHIP_ID }),
    );
    await assertSucceeds(
      getDocs(
        query(
          collection(db, name),
          where("relationshipId", "==", RELATIONSHIP_ID),
        ),
      ),
    );
  });

  it.each(collections)("keeps a stranger out of %s", async (name) => {
    const db = asStranger();
    await assertFails(
      addDoc(collection(db, name), { relationshipId: RELATIONSHIP_ID }),
    );
    await assertFails(
      getDocs(
        query(
          collection(db, name),
          where("relationshipId", "==", RELATIONSHIP_ID),
        ),
      ),
    );
  });
});

describe("journal entries", () => {
  it("lets the partner read an entry but not edit it", async () => {
    const supporterDb = testEnv.authenticatedContext(SUPPORTER).firestore();
    await assertSucceeds(getDoc(doc(supporterDb, "journalEntries", "entry-1")));
    await assertFails(
      updateDoc(doc(supporterDb, "journalEntries", "entry-1"), {
        text: "rewritten",
      }),
    );
  });

  it("hides entries from a stranger", async () => {
    await assertFails(getDoc(doc(asStranger(), "journalEntries", "entry-1")));
  });

  it("lets a member comment but rejects a forged author", async () => {
    const db = testEnv.authenticatedContext(SUPPORTER).firestore();
    await assertSucceeds(
      addDoc(collection(db, "journalEntries", "entry-1", "comments"), {
        entryId: "entry-1",
        authorId: SUPPORTER,
        text: "thinking of you",
      }),
    );
    await assertFails(
      addDoc(collection(db, "journalEntries", "entry-1", "comments"), {
        entryId: "entry-1",
        authorId: DOER,
        text: "not mine to write",
      }),
    );
  });
});

describe("messages", () => {
  it("rejects a message sent under someone else's id", async () => {
    const db = asDoer();
    await assertSucceeds(
      addDoc(collection(db, "messages"), {
        relationshipId: RELATIONSHIP_ID,
        senderId: DOER,
        text: "hi",
      }),
    );
    await assertFails(
      addDoc(collection(db, "messages"), {
        relationshipId: RELATIONSHIP_ID,
        senderId: SUPPORTER,
        text: "impersonation",
      }),
    );
  });

  it("does not allow history to be rewritten", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "messages", "message-1"), {
        relationshipId: RELATIONSHIP_ID,
        senderId: DOER,
        text: "hi",
      });
    });

    await assertFails(
      updateDoc(doc(asDoer(), "messages", "message-1"), { text: "edited" }),
    );
    await assertFails(deleteDoc(doc(asDoer(), "messages", "message-1")));
  });
});

describe("invites", () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "relationships", "relationship-open"), {
        name: "Doer + supporter",
        doerId: DOER,
        supporterId: null,
        status: "pending",
      });
      await setDoc(doc(db, "invites", CODE), {
        relationshipId: "relationship-open",
        createdBy: DOER,
        createdByRole: "doer",
        targetRole: "supporter",
        code: CODE,
        status: "pending",
        claimedBy: null,
      });
    });
  });

  it("cannot be enumerated by someone who does not hold the code", async () => {
    await assertFails(getDocs(collection(asStranger(), "invites")));
    await assertSucceeds(getDoc(doc(asStranger(), "invites", CODE)));
  });

  it("lets the holder claim the open slot exactly once", async () => {
    const db = asStranger();
    await assertSucceeds(
      updateDoc(doc(db, "relationships", "relationship-open"), {
        supporterId: STRANGER,
        status: "active",
      }),
    );
    await assertSucceeds(
      updateDoc(doc(db, "invites", CODE), {
        status: "accepted",
        claimedBy: STRANGER,
      }),
    );
    await assertFails(
      updateDoc(doc(db, "relationships", "relationship-open"), {
        doerId: STRANGER,
      }),
    );
  });

  it("refuses to let a claimant overwrite the filled slot", async () => {
    await assertFails(
      updateDoc(doc(asStranger(), "relationships", "relationship-open"), {
        doerId: STRANGER,
        supporterId: STRANGER,
      }),
    );
  });

  it("only lets the creator withdraw the invite", async () => {
    await assertFails(deleteDoc(doc(asStranger(), "invites", CODE)));
    await assertSucceeds(deleteDoc(doc(asDoer(), "invites", CODE)));
  });
});

describe("user profiles", () => {
  it("lets a signed-in user write only their own profile", async () => {
    const db = asDoer();
    await assertSucceeds(
      setDoc(doc(db, "users", DOER), { role: "doer", displayName: "D" }),
    );
    await assertFails(
      setDoc(doc(db, "users", SUPPORTER), { role: "supporter" }),
    );
  });

  it("does not allow listing the user directory", async () => {
    await assertFails(getDocs(collection(asDoer(), "users")));
  });
});
