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

  const eyebrow =
    "mb-[10px] text-[#7c2d12] text-[0.78rem] font-bold tracking-[0.18em] uppercase";

  const card =
    "flex flex-col gap-[18px] p-[22px] border border-[rgba(109,83,56,0.16)] rounded-[24px] bg-[#fff9f1] max-sm:p-[18px] max-sm:rounded-[22px]";

  const primaryButton =
    "border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#b45309,#7c2d12)] text-[#fff9f1] font-bold transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)] disabled:cursor-wait disabled:opacity-70 disabled:translate-y-0 disabled:[box-shadow:none]";

  const secondaryButton =
    "border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#0f766e,#115e59)] text-[#fff9f1] font-bold transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)] disabled:cursor-wait disabled:opacity-70 disabled:translate-y-0 disabled:[box-shadow:none]";

  return (
    <section className="flex flex-col gap-5 p-6 border border-[rgba(109,83,56,0.16)] rounded-[28px] bg-[rgba(255,250,244,0.9)] [box-shadow:var(--shadow-panel)] backdrop-blur-[10px] mb-5 max-sm:p-[18px] max-sm:rounded-[22px]">
      <div className="flex justify-between items-start gap-4 max-lg:flex-col max-lg:items-stretch">
        <div>
          <p className={eyebrow}>Relationship setup</p>
          <h4 className="font-[600] text-[1.55rem] leading-[1.05] [font-family:var(--font-sans)] text-[#1f1711]">Connect a doer and supporter with a real Firestore invite</h4>
        </div>
        <span className="inline-flex items-center justify-center px-3 py-[7px] rounded-full bg-[#fff1de] text-[#7c2d12] text-[0.86rem] font-bold">
          {currentRelationship?.status ?? "idle"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className={card}>
          <p className="text-[0.92rem] font-bold text-[#1f1711]">Create invite</p>
          <p className="text-[#8a7461]">
            Create a relationship and generate a code for the other role to claim.
          </p>
          <button className={primaryButton} disabled={isWorking} onClick={createInvite} type="button">
            {isWorking ? "Working..." : `Invite a ${userRole === "doer" ? "supporter" : "doer"}`}
          </button>
          {invite ? (
            <div className="flex flex-col gap-[6px] mt-[10px] p-[14px_16px] rounded-[18px] bg-[#fff4e4] text-[#7c2d12]">
              <span>Invite code</span>
              <strong className="text-[1.35rem] tracking-[0.08em]">{invite.code}</strong>
              <span>Waiting for a {invite.targetRole}</span>
            </div>
          ) : null}
        </div>

        <div className={card}>
          <p className="text-[0.92rem] font-bold text-[#1f1711]">Enter invite</p>
          <p className="text-[#8a7461]">
            Join an existing relationship by entering the code created by the other person.
          </p>
          <input
            className="w-full min-h-[46px] p-[11px_14px] border border-[rgba(109,83,56,0.2)] rounded-[16px] bg-[#fffdfa] text-[#1f1711]"
            onChange={(event) => setJoinCode(event.target.value)}
            placeholder="Enter invite code"
            type="text"
            value={joinCode}
          />
          <button className={secondaryButton} disabled={isWorking} onClick={joinRelationship} type="button">
            {isWorking ? "Working..." : "Join relationship"}
          </button>
        </div>
      </div>

      <div className={card}>
        <p className="text-[0.92rem] font-bold text-[#1f1711]">Connection state</p>
        <div className="flex flex-wrap gap-3 text-[#8a7461] text-[0.84rem] font-bold">
          <span>Current role: {userRole}</span>
          <span>Relationship: {currentRelationship ? currentRelationship.id : "none yet"}</span>
          <span>Invite: {invite?.status ?? "none"}</span>
        </div>
        {message ? <p className="text-[#8a7461]">{message}</p> : null}
      </div>
    </section>
  );
}
