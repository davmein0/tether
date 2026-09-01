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
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const DOER = "doer-uid";
const SUPPORTER = "supporter-uid";
const STRANGER = "stranger-uid";
const RELATIONSHIP_ID = "relationship-1";
const CODE = "ABCD2345";
const OTHER_CODE = "WXYZ6789";

function inMinutes(minutes: number) {
  return Timestamp.fromMillis(Date.now() + minutes * 60_000);
}

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

  it.each(collections)("refuses to move %s to another pair", async (name) => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), name, "doc-1"), {
        relationshipId: RELATIONSHIP_ID,
      });
    });

    await assertFails(
      updateDoc(doc(asDoer(), name, "doc-1"), {
        relationshipId: "somewhere-else",
      }),
    );
  });

  it.each(collections)("lets a member delete from %s", async (name) => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), name, "doc-1"), {
        relationshipId: RELATIONSHIP_ID,
      });
    });

    await assertSucceeds(deleteDoc(doc(asDoer(), name, "doc-1")));
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

  it("does not let a comment author hand the comment to someone else", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "journalEntries", "entry-1", "comments", "c1"),
        { entryId: "entry-1", authorId: SUPPORTER, text: "thinking of you" },
      );
    });

    const db = testEnv.authenticatedContext(SUPPORTER).firestore();
    await assertSucceeds(
      updateDoc(doc(db, "journalEntries", "entry-1", "comments", "c1"), {
        text: "edited",
      }),
    );
    await assertFails(
      updateDoc(doc(db, "journalEntries", "entry-1", "comments", "c1"), {
        authorId: STRANGER,
      }),
    );
  });

  it("keeps a stranger out of the comments", async () => {
    await assertFails(
      addDoc(collection(asStranger(), "journalEntries", "entry-1", "comments"), {
        entryId: "entry-1",
        authorId: STRANGER,
        text: "uninvited",
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
        expiresAt: inMinutes(60),
      });
      // An unrelated invite the stranger also happens to hold.
      await setDoc(doc(db, "invites", OTHER_CODE), {
        relationshipId: "some-other-relationship",
        createdBy: SUPPORTER,
        createdByRole: "supporter",
        targetRole: "doer",
        code: OTHER_CODE,
        status: "pending",
        claimedBy: null,
        expiresAt: inMinutes(60),
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
        claimedWithCode: CODE,
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
        claimedWithCode: CODE,
      }),
    );
  });

  it("refuses a claim that names no invite", async () => {
    await assertFails(
      updateDoc(doc(asStranger(), "relationships", "relationship-open"), {
        supporterId: STRANGER,
        status: "active",
      }),
    );
  });

  it("refuses a code belonging to a different relationship", async () => {
    await assertFails(
      updateDoc(doc(asStranger(), "relationships", "relationship-open"), {
        supporterId: STRANGER,
        status: "active",
        claimedWithCode: OTHER_CODE,
      }),
    );
  });

  it("refuses an expired code", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore(), "invites", CODE), {
        expiresAt: inMinutes(-1),
      });
    });

    await assertFails(
      updateDoc(doc(asStranger(), "relationships", "relationship-open"), {
        supporterId: STRANGER,
        status: "active",
        claimedWithCode: CODE,
      }),
    );
  });

  it("does not let the creator reopen an accepted invite", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore(), "invites", CODE), {
        status: "accepted",
        claimedBy: STRANGER,
      });
    });

    await assertFails(
      updateDoc(doc(asDoer(), "invites", CODE), {
        status: "pending",
        claimedBy: null,
      }),
    );
  });

  it("does not let a claimant re-point an invite at another relationship", async () => {
    await assertFails(
      updateDoc(doc(asStranger(), "invites", CODE), {
        status: "accepted",
        claimedBy: STRANGER,
        relationshipId: "some-other-relationship",
      }),
    );
  });

  it("only lets the creator withdraw the invite", async () => {
    await assertFails(deleteDoc(doc(asStranger(), "invites", CODE)));
    await assertSucceeds(deleteDoc(doc(asDoer(), "invites", CODE)));
  });
});

describe("relationship status", () => {
  it("lets a member end an active pair but not revive it", async () => {
    await assertSucceeds(
      updateDoc(doc(asDoer(), "relationships", RELATIONSHIP_ID), {
        status: "ended",
      }),
    );
    await assertFails(
      updateDoc(doc(asDoer(), "relationships", RELATIONSHIP_ID), {
        status: "active",
      }),
    );
  });

  it("does not let a member self-activate a pending pair", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "relationships", "solo"), {
        name: "Doer + supporter",
        doerId: DOER,
        supporterId: null,
        status: "pending",
      });
    });

    await assertFails(
      updateDoc(doc(asDoer(), "relationships", "solo"), { status: "active" }),
    );
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

  it("rejects a role outside the two the app knows", async () => {
    await assertFails(
      setDoc(doc(asDoer(), "users", DOER), { role: "admin" }),
    );
  });

  it("does not allow listing the user directory", async () => {
    await assertFails(getDocs(collection(asDoer(), "users")));
  });
});
