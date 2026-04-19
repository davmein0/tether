import { useEffect, useState } from "react";
import type { UserRole } from "../types";
import type { InviteRecord, RelationshipRecord } from "../types";
import {
  acceptInvite,
  createInviteForUser,
  getPendingInviteForUser,
} from "../services/relationships";

type Props = {
  currentRelationship: RelationshipRecord | null;
  onRelationshipChange: (relationship: RelationshipRecord | null) => void;
  userId: string;
  userRole: UserRole;
};

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";
const card = "bg-stone-50 rounded-2xl border border-stone-100 flex flex-col gap-3 p-5";
const inputCls = "w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400";
const primaryBtn = "bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0";
const secondaryBtn = "bg-white hover:bg-stone-50 text-stone-600 rounded-full px-4 py-2 text-sm font-medium border border-stone-200 transition-colors";

export default function ConnectionSimulator({
  currentRelationship,
  onRelationshipChange,
  userId,
  userRole,
}: Props) {
  const [invite, setInvite] = useState<InviteRecord | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const loadInvite = async () => {
      const pendingInvite = await getPendingInviteForUser(userId);
      setInvite(pendingInvite);
    };

    void loadInvite();
  }, [userId]);

  const createInvite = async () => {
    if (currentRelationship) {
      setMessage("You already have a relationship record. Use the existing invite or reset from Firestore.");
      return;
    }

    setIsWorking(true);

    try {
      const result = await createInviteForUser(userId, userRole);
      setInvite(result.invite);
      onRelationshipChange(result.relationship);
      setMessage(`Invite created. Share code ${result.invite.code} with your ${result.invite.targetRole}.`);
    } catch (error) {
      console.error("Create invite error:", error);
      setMessage("We could not create the invite. Check Firestore rules and try again.");
    } finally {
      setIsWorking(false);
    }
  };

  const joinRelationship = async () => {
    setIsWorking(true);

    try {
      const relationship = await acceptInvite(userId, userRole, joinCode.trim().toUpperCase());
      onRelationshipChange(relationship);
      setInvite(null);
      setJoinCode("");
      setMessage("Relationship connected through Firestore.");
    } catch (error) {
      console.error("Accept invite error:", error);
      setMessage(error instanceof Error ? error.message : "We could not accept that invite.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-5 p-6 mb-6">
      <div className="flex justify-between items-center gap-4 mb-4">
        <div>
          <p className={eyebrow}>Relationship setup</p>
          <h4 className="text-lg font-semibold text-stone-800">Connect a doer and supporter with a real Firestore invite</h4>
        </div>
        <span className="bg-stone-100 text-stone-600 text-xs font-semibold px-3 py-1 rounded-full">
          {currentRelationship?.status ?? "idle"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className={card}>
          <p className="text-sm font-semibold text-stone-800">Create invite</p>
          <p className="text-stone-600 text-sm leading-relaxed">
            Create a relationship and generate a code for the other role to claim.
          </p>
          <button className={primaryBtn} disabled={isWorking} onClick={createInvite} type="button">
            {isWorking ? "Working..." : `Invite a ${userRole === "doer" ? "supporter" : "doer"}`}
          </button>
          {invite ? (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col gap-1.5 mt-1">
              <span className="text-stone-600 text-sm">Invite code</span>
              <strong className="text-amber-700 text-xl tracking-widest">{invite.code}</strong>
              <span className="text-stone-400 text-xs">Waiting for a {invite.targetRole}</span>
            </div>
          ) : null}
        </div>

        <div className={card}>
          <p className="text-sm font-semibold text-stone-800">Enter invite</p>
          <p className="text-stone-600 text-sm leading-relaxed">
            Join an existing relationship by entering the code created by the other person.
          </p>
          <input
            className={inputCls}
            onChange={(event) => setJoinCode(event.target.value)}
            placeholder="Enter invite code"
            type="text"
            value={joinCode}
          />
          <button className={secondaryBtn} disabled={isWorking} onClick={joinRelationship} type="button">
            {isWorking ? "Working..." : "Join relationship"}
          </button>
        </div>
      </div>

      <div className={card}>
        <p className="text-sm font-semibold text-stone-800">Connection state</p>
        <div className="flex flex-wrap gap-3 text-stone-400 text-xs font-semibold">
          <span>Current role: {userRole}</span>
          <span>Relationship: {currentRelationship ? currentRelationship.id : "none yet"}</span>
          <span>Invite: {invite?.status ?? "none"}</span>
        </div>
        {message ? <p className="text-stone-600 text-sm leading-relaxed">{message}</p> : null}
      </div>
    </section>
  );
}
