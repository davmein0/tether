import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import ConnectionSimulator from "./components/ConnectionSimulator";
import Login from "./components/GoogleLogin";
import { getUserProfile, saveUserProfile, signInWithGoogle } from "./auth";
import DoerDashboard from "./pages/DoerDashboard";
import GoalLogPage from "./pages/GoalLogPage";
import GoalsPage from "./pages/GoalsPage";
import SupporterDashboard from "./pages/SupporterDashboard";
import TimelinePage from "./pages/TimelinePage";
import { auth } from "./services/firebase";
import { getRelationshipForUser } from "./services/relationships";
import type { AppUser, RelationshipRecord, UserRole } from "./types";

type AppPage = "dashboard" | "goal-log" | "goals" | "timeline";
type AuthStage = "loading" | "signed-out" | "needs-role" | "ready";

function getPageFromHash(): AppPage {
  if (window.location.hash === "#goal-log") return "goal-log";
  if (window.location.hash === "#goals") return "goals";
  if (window.location.hash === "#timeline") return "timeline";
  return "dashboard";
}

export default function App() {
  const [page, setPage] = useState<AppPage>(getPageFromHash);
  const [authStage, setAuthStage] = useState<AuthStage>("loading");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [relationship, setRelationship] = useState<RelationshipRecord | null>(
    null,
  );
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSavingRole, setIsSavingRole] = useState(false);

  useEffect(() => {
    const syncPage = () => setPage(getPageFromHash());

    window.addEventListener("hashchange", syncPage);

    return () => window.removeEventListener("hashchange", syncPage);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setAppUser(null);
        setRelationship(null);
        setAuthStage("signed-out");
        return;
      }

      const profile = await getUserProfile(user.uid);

      if (profile?.role) {
        setAppUser(profile);
        setAuthStage("ready");
        return;
      }

      setAppUser(null);
      setAuthStage("needs-role");
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadRelationship = async () => {
      if (!firebaseUser || !appUser?.role) {
        setRelationship(null);
        return;
      }

      const nextRelationship = await getRelationshipForUser(
        firebaseUser.uid,
        appUser.role as UserRole,
      );

      setRelationship(nextRelationship);
    };

    void loadRelationship();
  }, [appUser, firebaseUser]);

  const navigate = (nextPage: AppPage) => {
    if (nextPage === "goal-log") {
      window.location.hash = "goal-log";
      return;
    }

    if (nextPage === "goals") {
      window.location.hash = "goals";
      return;
    }

    if (nextPage === "timeline") {
      window.location.hash = "timeline";
      return;
    }

    window.location.hash = "";
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    await signInWithGoogle();
    setIsSigningIn(false);
  };

  const handleRoleSelection = async (role: UserRole) => {
    if (!firebaseUser) return;

    setIsSavingRole(true);
    const profile = await saveUserProfile(firebaseUser, role);
    setAppUser(profile);
    setAuthStage("ready");
    setIsSavingRole(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAppUser(null);
    setFirebaseUser(null);
    setRelationship(null);
    setAuthStage("signed-out");
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Tether</p>
          <h1>Shared support for goals, routines, and hard moments.</h1>
        </div>
        <div className="app-header-actions">
          <Login
            isLoading={isSigningIn}
            onSignIn={handleSignIn}
            user={firebaseUser}
          />
          {appUser ? (
            <button className="nav-pill" onClick={handleSignOut} type="button">
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      {authStage === "loading" ? (
        <section className="dashboard-panel auth-state-panel">
          <p className="eyebrow">Checking session</p>
          <h3>Loading your workspace...</h3>
        </section>
      ) : authStage === "signed-out" ? (
        <section className="dashboard-panel auth-state-panel">
          <p className="eyebrow">Welcome</p>
          <h3>
            Sign in with Google to create your profile and open the dashboard.
          </h3>
        </section>
      ) : (
        <>
          {appUser && firebaseUser && !relationship ? (
            <ConnectionSimulator
              currentRelationship={relationship}
              onRelationshipChange={setRelationship}
              userId={firebaseUser.uid}
              userRole={appUser.role as UserRole}
            />
          ) : null}

          <nav className="top-nav" aria-label="Primary">
            <button
              className={
                page === "dashboard" ? "nav-pill nav-pill-active" : "nav-pill"
              }
              onClick={() => navigate("dashboard")}
              type="button"
            >
              Dashboard
            </button>
            <button
              className={
                page === "goals" ? "nav-pill nav-pill-active" : "nav-pill"
              }
              onClick={() => navigate("goals")}
              type="button"
            >
              Goals
            </button>
            <button
              className={
                page === "timeline" ? "nav-pill nav-pill-active" : "nav-pill"
              }
              onClick={() => navigate("timeline")}
              type="button"
            >
              Timeline
            </button>
            <button
              className={
                page === "goal-log" ? "nav-pill nav-pill-active" : "nav-pill"
              }
              onClick={() => navigate("goal-log")}
              type="button"
            >
              Goal log
            </button>
          </nav>

          {page === "goal-log" ? (
            relationship ? (
              <GoalLogPage relationshipId={relationship.id} />
            ) : (
              <section className="dashboard-panel auth-state-panel">
                <p className="eyebrow">Connect first</p>
                <h3>Create or accept an invite before logging goals.</h3>
              </section>
            )
          ) : page === "goals" ? (
            relationship ? (
              <GoalsPage relationshipId={relationship.id} />
            ) : (
              <section className="dashboard-panel auth-state-panel">
                <p className="eyebrow">Connect first</p>
                <h3>Create or accept an invite before viewing goals.</h3>
              </section>
            )
          ) : page === "timeline" ? (
            relationship ? (
              <TimelinePage relationshipId={relationship.id} />
            ) : (
              <section className="dashboard-panel auth-state-panel">
                <p className="eyebrow">Connect first</p>
                <h3>Create or accept an invite before using the timeline.</h3>
              </section>
            )
          ) : (
            <div className="app-layout">
              {relationship && firebaseUser ? (
                <DoerDashboard
                  currentUserId={firebaseUser.uid}
                  relationshipId={relationship.id}
                />
              ) : (
                <section className="dashboard-panel auth-state-panel">
                  <p className="eyebrow">Connect first</p>
                  <h3>Create or accept an invite to open shared support.</h3>
                </section>
              )}

              {relationship && firebaseUser ? (
                <SupporterDashboard
                  currentUserId={firebaseUser.uid}
                  relationshipId={relationship.id}
                />
              ) : (
                <section className="dashboard-panel auth-state-panel">
                  <p className="eyebrow">Connect first</p>
                  <h3>The mentor view will come alive after the relationship is connected.</h3>
                </section>
              )}
            </div>
          )}
        </>
      )}

      {authStage === "needs-role" && firebaseUser ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-labelledby="role-modal-title"
            aria-modal="true"
            className="modal-card"
            role="dialog"
          >
            <p className="eyebrow">Choose your role</p>
            <h3 id="role-modal-title">What are you here for?</h3>
            <p className="modal-copy">
              Note: If you are in immediate need of support, please seek
              professional help ASAP. This app is not supposed to replace real
              human connection or professional services.
            </p>
            <div className="modal-actions">
              <button
                className="primary-button"
                disabled={isSavingRole}
                onClick={() => handleRoleSelection("doer")}
                type="button"
              >
                {isSavingRole ? "Saving..." : "I need help"}
              </button>
              <button
                className="secondary-button"
                disabled={isSavingRole}
                onClick={() => handleRoleSelection("supporter")}
                type="button"
              >
                {isSavingRole ? "Saving..." : "I am a supporter"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
