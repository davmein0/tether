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

  return (
    <section className="dashboard-panel connection-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Relationship setup</p>
          <h4>Connect a doer and supporter with a real Firestore invite</h4>
        </div>
        <span className="section-badge">{currentRelationship?.status ?? "idle"}</span>
      </div>

      <div className="connection-grid">
        <div className="card">
          <p className="support-label">Create invite</p>
          <p className="connection-copy">
            Create a relationship and generate a code for the other role to claim.
          </p>
          <button className="primary-button" disabled={isWorking} onClick={createInvite} type="button">
            {isWorking ? "Working..." : `Invite a ${userRole === "doer" ? "supporter" : "doer"}`}
          </button>
          {invite ? (
            <div className="connection-code">
              <span>Invite code</span>
              <strong>{invite.code}</strong>
              <span>Waiting for a {invite.targetRole}</span>
            </div>
          ) : null}
        </div>

        <div className="card">
          <p className="support-label">Enter invite</p>
          <p className="connection-copy">
            Join an existing relationship by entering the code created by the other person.
          </p>
          <input
            onChange={(event) => setJoinCode(event.target.value)}
            placeholder="Enter invite code"
            type="text"
            value={joinCode}
          />
          <button className="secondary-button" disabled={isWorking} onClick={joinRelationship} type="button">
            {isWorking ? "Working..." : "Join relationship"}
          </button>
        </div>
      </div>

      <div className="card">
        <p className="support-label">Connection state</p>
        <div className="rating-row">
          <span>Current role: {userRole}</span>
          <span>Relationship: {currentRelationship ? currentRelationship.id : "none yet"}</span>
          <span>Invite: {invite?.status ?? "none"}</span>
        </div>
        {message ? <p className="connection-copy">{message}</p> : null}
      </div>
    </section>
  );
}
