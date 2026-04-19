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

const eyebrow = "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";
const navSecondary = "bg-white hover:bg-stone-50 text-stone-600 rounded-full px-4 py-2 text-sm font-medium border border-stone-200 transition-colors";
const navActive = "bg-stone-900 text-white rounded-full px-4 py-2 text-sm font-medium border-0 transition-colors";
const authPanel = "bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-5 p-6 min-h-[220px] justify-center";

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
    <main className="max-w-[1380px] mx-auto px-4 py-8">
      <header className="flex items-end justify-between gap-6 mb-8">
        <div>
          <p className={eyebrow}>Tether</p>
          <h1 className="text-5xl font-bold text-stone-900 leading-none tracking-tight [font-family:var(--font-serif)]">
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
            <button className={navSecondary} onClick={handleSignOut} type="button">
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      {authStage === "loading" ? (
        <section className={authPanel}>
          <p className={eyebrow}>Checking session</p>
          <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">Loading your workspace...</h3>
        </section>
      ) : authStage === "signed-out" ? (
        <section className={authPanel}>
          <p className={eyebrow}>Welcome</p>
          <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
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

          <nav className="flex gap-2 mb-6" aria-label="Primary">
            <button
              className={page === "dashboard" ? navActive : navSecondary}
              onClick={() => navigate("dashboard")}
              type="button"
            >
              Dashboard
            </button>
            <button
              className={page === "goals" ? navActive : navSecondary}
              onClick={() => navigate("goals")}
              type="button"
            >
              Goals
            </button>
            <button
              className={page === "timeline" ? navActive : navSecondary}
              onClick={() => navigate("timeline")}
              type="button"
            >
              Timeline
            </button>
            <button
              className={page === "goal-log" ? navActive : navSecondary}
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
              <section className={authPanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">Create or accept an invite before logging goals.</h3>
              </section>
            )
          ) : page === "goals" ? (
            relationship ? (
              <GoalsPage relationshipId={relationship.id} />
            ) : (
              <section className={authPanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">Create or accept an invite before viewing goals.</h3>
              </section>
            )
          ) : page === "timeline" ? (
            relationship ? (
              <TimelinePage relationshipId={relationship.id} />
            ) : (
              <section className={authPanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">Create or accept an invite before using the timeline.</h3>
              </section>
            )
          ) : relationship && firebaseUser && appUser?.role === "doer" ? (
            <DoerDashboard
              currentUserId={firebaseUser.uid}
              relationshipId={relationship.id}
            />
          ) : relationship && firebaseUser && appUser?.role === "supporter" ? (
            <SupporterDashboard
              currentUserId={firebaseUser.uid}
              relationshipId={relationship.id}
            />
          ) : (
            <section className={authPanel}>
              <p className={eyebrow}>Connect first</p>
              <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">Create or accept an invite to open your dashboard.</h3>
            </section>
          )}
        </>
      )}

      {authStage === "needs-role" && firebaseUser ? (
        <div
          className="fixed inset-0 flex items-center justify-center p-5 bg-stone-900/40 backdrop-blur-sm"
          role="presentation"
        >
          <section
            aria-labelledby="role-modal-title"
            aria-modal="true"
            className="w-[min(560px,100%)] flex flex-col gap-4 p-7 rounded-3xl border border-stone-200 bg-white shadow-xl"
            role="dialog"
          >
            <p className={eyebrow}>Choose your role</p>
            <h3 id="role-modal-title" className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">What are you here for?</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Note: If you are in immediate need of support, please seek
              professional help ASAP. This app is not supposed to replace real
              human connection or professional services.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0"
                disabled={isSavingRole}
                onClick={() => handleRoleSelection("doer")}
                type="button"
              >
                {isSavingRole ? "Saving..." : "I need help"}
              </button>
              <button
                className="bg-white hover:bg-stone-50 text-stone-600 rounded-full px-4 py-2 text-sm font-medium border border-stone-200 transition-colors"
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
