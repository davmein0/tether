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

  /* shared class strings */
  const panelBase =
    "flex flex-col gap-5 p-6 border border-[rgba(109,83,56,0.16)] rounded-[28px] bg-[rgba(255,250,244,0.9)] [box-shadow:var(--shadow-panel)] backdrop-blur-[10px] max-sm:p-[18px] max-sm:rounded-[22px]";

  const authStatePanel = `${panelBase} items-start min-h-[220px] justify-center`;

  const navPillBase =
    "border border-[rgba(109,83,56,0.16)] rounded-full px-[18px] py-3 font-bold text-[0.88rem] transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)]";
  const navPillInactive = `${navPillBase} bg-[rgba(255,249,241,0.8)] text-[#7c2d12] [box-shadow:none]`;
  const navPillActive = `${navPillBase} bg-[linear-gradient(135deg,#b45309,#7c2d12)] text-[#fff9f1] border-transparent`;

  const eyebrow =
    "mb-[10px] text-[#7c2d12] text-[0.78rem] font-bold tracking-[0.18em] uppercase";

  return (
    <main className="w-[min(1380px,calc(100%-32px))] mx-auto py-8 pb-10 max-sm:py-5 max-sm:pb-6">
      <header className="flex items-end justify-between gap-6 mb-7 max-lg:flex-col max-lg:items-stretch">
        <div>
          <p className={eyebrow}>Tether</p>
          <h1 className="max-w-[720px] font-[600] text-[clamp(2.4rem,4vw,4.6rem)] leading-[0.95] [font-family:var(--font-sans)] text-[#1f1711] tracking-[-0.04em]">
            Shared support for goals, routines, and hard moments.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Login
            isLoading={isSigningIn}
            onSignIn={handleSignIn}
            user={firebaseUser}
          />
          {appUser ? (
            <button
              className={navPillInactive}
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      {authStage === "loading" ? (
        <section className={authStatePanel}>
          <p className={eyebrow}>Checking session</p>
          <h3 className="font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">Loading your workspace...</h3>
        </section>
      ) : authStage === "signed-out" ? (
        <section className={authStatePanel}>
          <p className={eyebrow}>Welcome</p>
          <h3 className="font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">
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

          <nav className="flex gap-3 mb-5" aria-label="Primary">
            <button
              className={page === "dashboard" ? navPillActive : navPillInactive}
              onClick={() => navigate("dashboard")}
              type="button"
            >
              Dashboard
            </button>
            <button
              className={page === "goals" ? navPillActive : navPillInactive}
              onClick={() => navigate("goals")}
              type="button"
            >
              Goals
            </button>
            <button
              className={page === "timeline" ? navPillActive : navPillInactive}
              onClick={() => navigate("timeline")}
              type="button"
            >
              Timeline
            </button>
            <button
              className={page === "goal-log" ? navPillActive : navPillInactive}
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
              <section className={authStatePanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">Create or accept an invite before logging goals.</h3>
              </section>
            )
          ) : page === "goals" ? (
            relationship ? (
              <GoalsPage relationshipId={relationship.id} />
            ) : (
              <section className={authStatePanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">Create or accept an invite before viewing goals.</h3>
              </section>
            )
          ) : page === "timeline" ? (
            relationship ? (
              <TimelinePage relationshipId={relationship.id} />
            ) : (
              <section className={authStatePanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">Create or accept an invite before using the timeline.</h3>
              </section>
            )
          ) : (
            <div className="grid grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)] gap-6 items-start max-lg:grid-cols-1">
              {relationship && firebaseUser ? (
                <DoerDashboard
                  currentUserId={firebaseUser.uid}
                  relationshipId={relationship.id}
                />
              ) : (
                <section className={authStatePanel}>
                  <p className={eyebrow}>Connect first</p>
                  <h3 className="font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">Create or accept an invite to open shared support.</h3>
                </section>
              )}

              {relationship && firebaseUser ? (
                <SupporterDashboard
                  currentUserId={firebaseUser.uid}
                  relationshipId={relationship.id}
                />
              ) : (
                <section className={authStatePanel}>
                  <p className={eyebrow}>Connect first</p>
                  <h3 className="font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">The mentor view will come alive after the relationship is connected.</h3>
                </section>
              )}
            </div>
          )}
        </>
      )}

      {authStage === "needs-role" && firebaseUser ? (
        <div
          className="fixed inset-0 flex items-center justify-center p-5 bg-[rgba(31,23,17,0.38)] backdrop-blur-[6px]"
          role="presentation"
        >
          <section
            aria-labelledby="role-modal-title"
            aria-modal="true"
            className="w-[min(560px,100%)] flex flex-col gap-4 p-7 rounded-[28px] border border-[rgba(109,83,56,0.16)] bg-[rgba(255,249,241,0.98)] [box-shadow:var(--shadow-panel)]"
            role="dialog"
          >
            <p className={eyebrow}>Choose your role</p>
            <h3 id="role-modal-title" className="font-[600] text-[clamp(1.8rem,2.8vw,3rem)] leading-[1.02] [font-family:var(--font-sans)] text-[#1f1711]">What are you here for?</h3>
            <p className="text-[#8a7461]">
              Note: If you are in immediate need of support, please seek
              professional help ASAP. This app is not supposed to replace real
              human connection or professional services.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                className="border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#b45309,#7c2d12)] text-[#fff9f1] font-bold transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)] disabled:cursor-wait disabled:opacity-70 disabled:translate-y-0 disabled:[box-shadow:none]"
                disabled={isSavingRole}
                onClick={() => handleRoleSelection("doer")}
                type="button"
              >
                {isSavingRole ? "Saving..." : "I need help"}
              </button>
              <button
                className="border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#0f766e,#115e59)] text-[#fff9f1] font-bold transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)] disabled:cursor-wait disabled:opacity-70 disabled:translate-y-0 disabled:[box-shadow:none]"
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
