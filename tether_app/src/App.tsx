import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ConnectionSimulator from "./components/ConnectionSimulator";
import Login from "./components/GoogleLogin";
import { getUserProfile, saveUserProfile, signInWithGoogle } from "./auth";
import { db } from "./services/firebase";
import DoerDashboard from "./pages/DoerDashboard";
import GoalLogPage from "./pages/GoalLogPage";
import GoalsPage from "./pages/GoalsPage";
import JournalPage from "./pages/Journal";
import ReviewsPage from "./pages/Reviews";
import SupporterDashboard from "./pages/SupporterDashboard";
import TimelinePage from "./pages/TimelinePage";
import { auth } from "./services/firebase";
import { getRelationshipForUser } from "./services/relationships";
import type { AppUser, RelationshipRecord, UserRole } from "./types";

type AppPage =
  | "dashboard"
  | "goal-log"
  | "goals"
  | "timeline"
  | "journal"
  | "reviews";
type AuthStage = "loading" | "signed-out" | "needs-role" | "ready";

function getPageFromHash(): AppPage {
  if (window.location.hash === "#goal-log") return "goal-log";
  if (window.location.hash === "#goals") return "goals";
  if (window.location.hash === "#timeline") return "timeline";
  if (window.location.hash === "#journal") return "journal";
  if (window.location.hash === "#reviews") return "reviews";
  return "dashboard";
}

const eyebrow =
  "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";
const navSecondary =
  "bg-white hover:bg-stone-50 text-stone-600 rounded-full px-4 py-2 text-sm font-medium border border-stone-200 transition-colors";
const navActive =
  "bg-stone-900 text-white rounded-full px-4 py-2 text-sm font-medium border-0 transition-colors";
const authPanel =
  "bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-5 p-6 min-h-[220px] justify-center";

export default function App() {
  const [page, setPage] = useState<AppPage>(getPageFromHash);
  const [authStage, setAuthStage] = useState<AuthStage>("loading");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [relationship, setRelationship] = useState<RelationshipRecord | null>(
    null,
  );
  const [partnerUser, setPartnerUser] = useState<AppUser | null>(null);
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
        setPartnerUser(null);
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

  useEffect(() => {
    const loadPartnerProfile = async () => {
      if (!relationship || !firebaseUser || !appUser) {
        setPartnerUser(null);
        return;
      }

      const partnerId =
        appUser.role === "doer"
          ? relationship.supporterId
          : relationship.doerId;

      if (!partnerId) {
        setPartnerUser(null);
        return;
      }

      const partner = await getUserProfile(partnerId);
      setPartnerUser(partner);
    };

    void loadPartnerProfile();
  }, [relationship, firebaseUser, appUser]);

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

    if (nextPage === "journal") {
      window.location.hash = "journal";
      return;
    }

    if (nextPage === "reviews") {
      window.location.hash = "reviews";
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
      <header className="mb-8">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <p className={eyebrow}>Tether</p>
            <h1 className="text-5xl font-bold text-stone-900 leading-none tracking-tight [font-family:var(--font-serif)]">
              Emotional support buddy system for fighting addictions together.
            </h1>
          </div>

          <div className="flex flex-col gap-4 min-w-[280px]">
            {/* Current User Profile */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                {firebaseUser?.photoURL && (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || "User"}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {firebaseUser?.displayName || "You"}
                  </p>
                  {appUser && (
                    <p className="text-xs text-stone-600 capitalize">
                      {appUser.role === "doer" ? "Mentee" : "Mentor"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Partner Profile */}
            {partnerUser && relationship && (
              <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
                <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">
                  Your {partnerUser.role === "doer" ? "Mentee" : "Mentor"}
                </p>
                <div className="flex items-center gap-3">
                  {/* Partner photo would go here if available */}
                  <div className="w-10 h-10 rounded-full bg-stone-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {partnerUser.displayName || "Partner"}
                    </p>
                    <p className="text-xs text-stone-600 capitalize">
                      {partnerUser.role === "doer" ? "Mentee" : "Mentor"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Auth Buttons */}
            <div className="flex gap-2">
              <Login
                isLoading={isSigningIn}
                onSignIn={handleSignIn}
                user={firebaseUser}
              />
              {appUser ? (
                <button
                  className={navSecondary}
                  onClick={handleSignOut}
                  type="button"
                >
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {authStage === "loading" ? (
        <section className={authPanel}>
          <p className={eyebrow}>Checking session</p>
          <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
            Loading your workspace...
          </h3>
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
              className={page === "journal" ? navActive : navSecondary}
              onClick={() => navigate("journal")}
              type="button"
            >
              Journal
            </button>
            <button
              className={page === "reviews" ? navActive : navSecondary}
              onClick={() => navigate("reviews")}
              type="button"
            >
              Reviews
            </button>
          </nav>

          {page === "goal-log" ? (
            relationship ? (
              <GoalLogPage relationshipId={relationship.id} />
            ) : (
              <section className={authPanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
                  Create or accept an invite before logging goals.
                </h3>
              </section>
            )
          ) : page === "journal" ? (
            relationship && firebaseUser ? (
              <JournalPage
                relationshipId={relationship.id}
                userId={firebaseUser.uid}
              />
            ) : (
              <section className={authPanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
                  Create or accept an invite before journaling.
                </h3>
              </section>
            )
          ) : page === "reviews" ? (
            relationship && firebaseUser && appUser ? (
              <ReviewsPage
                relationshipId={relationship.id}
                userId={firebaseUser.uid}
                userRole={appUser.role as UserRole}
              />
            ) : (
              <section className={authPanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
                  Create or accept an invite before reviewing progress.
                </h3>
              </section>
            )
          ) : page === "goals" ? (
            relationship ? (
              <GoalsPage relationshipId={relationship.id} />
            ) : (
              <section className={authPanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
                  Create or accept an invite before viewing goals.
                </h3>
              </section>
            )
          ) : page === "timeline" ? (
            relationship ? (
              <TimelinePage relationshipId={relationship.id} />
            ) : (
              <section className={authPanel}>
                <p className={eyebrow}>Connect first</p>
                <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
                  Create or accept an invite before using the timeline.
                </h3>
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
              <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
                Create or accept an invite to open shared support.
              </h3>
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
            <h3
              id="role-modal-title"
              className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]"
            >
              What are you here for?
            </h3>
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
