import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import ConnectionSimulator from "./components/ConnectionSimulator";
import ErrorBanner from "./components/ErrorBanner";
import Login from "./components/GoogleLogin";
import { getUserProfile, saveUserProfile, signInWithGoogle } from "./auth";
import DoerDashboard from "./pages/DoerDashboard";
import GoalLogPage from "./pages/GoalLogPage";
import GoalsPage from "./pages/GoalsPage";
import JournalPage from "./pages/Journal";
import ReviewsPage from "./pages/Reviews";
import SupporterDashboard from "./pages/SupporterDashboard";
import TimelinePage from "./pages/TimelinePage";
import { auth } from "./services/firebase";
import { subscribeToRelationshipForUser } from "./services/relationships";
import type { AppUser, RelationshipRecord, UserRole } from "./types";

const PAGES = [
  { id: "dashboard", label: "Dashboard", hash: "" },
  { id: "goals", label: "Goals", hash: "goals" },
  { id: "timeline", label: "Timeline", hash: "timeline" },
  { id: "journal", label: "Journal", hash: "journal" },
  { id: "reviews", label: "Reviews", hash: "reviews" },
  { id: "goal-log", label: "Goal log", hash: "goal-log", hidden: true },
] as const;

type AppPage = (typeof PAGES)[number]["id"];
type AuthStage = "loading" | "signed-out" | "needs-role" | "ready";

function getPageFromHash(): AppPage {
  const hash = window.location.hash.replace(/^#/, "");
  return PAGES.find((entry) => entry.hash === hash)?.id ?? "dashboard";
}

const eyebrow =
  "text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mb-1";
const navSecondary =
  "bg-white hover:bg-stone-50 text-stone-600 rounded-full px-4 py-2 text-sm font-medium border border-stone-200 transition-colors";
const navActive =
  "bg-stone-900 text-white rounded-full px-4 py-2 text-sm font-medium border-0 transition-colors";
const authPanel =
  "bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-5 p-6 min-h-[220px] justify-center";

function ConnectRequired({ action }: { action: string }) {
  return (
    <section className={authPanel}>
      <p className={eyebrow}>Connect first</p>
      <h3 className="text-2xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
        Create or accept an invite before {action}.
      </h3>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState<AppPage>(getPageFromHash);
  const [authStage, setAuthStage] = useState<AuthStage>("loading");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [subscribedRelationship, setSubscribedRelationship] =
    useState<RelationshipRecord | null>(null);
  const [partnerUser, setPartnerUser] = useState<AppUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [relationshipError, setRelationshipError] = useState<string | null>(
    null,
  );
  const roleDialogRef = useRef<HTMLElement | null>(null);

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
        setSubscribedRelationship(null);
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

  // Live, so the pending-invite screen swaps for the dashboard the moment the
  // other person accepts.
  useEffect(() => {
    if (!firebaseUser || !appUser?.role) return;

    return subscribeToRelationshipForUser(
      firebaseUser.uid,
      appUser.role,
      (next) => {
        setSubscribedRelationship(next);
        setRelationshipError(null);
      },
      (error) => {
        console.error("relationship listener error:", error);
        setRelationshipError(
          "We couldn't load your connection. Check your network and reload.",
        );
      },
    );
  }, [appUser, firebaseUser]);

  // Ignore the last subscription's value while signed out instead of clearing
  // it from an effect.
  const relationship =
    firebaseUser && appUser?.role ? subscribedRelationship : null;

  // A pending relationship is half a pair: the shared pages need an accepted
  // one, while setup stays on screen so the creator can share or cancel the code.
  const activeRelationship =
    relationship?.status === "active" ? relationship : null;

  useEffect(() => {
    const loadPartnerProfile = async () => {
      if (!activeRelationship || !firebaseUser || !appUser) {
        setPartnerUser(null);
        return;
      }

      const partnerId =
        appUser.role === "doer"
          ? activeRelationship.supporterId
          : activeRelationship.doerId;

      if (!partnerId) {
        setPartnerUser(null);
        return;
      }

      const partner = await getUserProfile(partnerId);
      setPartnerUser(partner);
    };

    void loadPartnerProfile();
  }, [activeRelationship, firebaseUser, appUser]);

  useEffect(() => {
    if (authStage !== "needs-role") return;
    roleDialogRef.current?.focus();
  }, [authStage]);

  const navigate = (nextPage: AppPage) => {
    const hash = PAGES.find((entry) => entry.id === nextPage)?.hash ?? "";
    window.location.assign(`#${hash}`);
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in error:", error);
      setAuthError("Google sign-in failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRoleSelection = async (role: UserRole) => {
    if (!firebaseUser) return;

    setIsSavingRole(true);
    setAuthError(null);
    try {
      const profile = await saveUserProfile(firebaseUser, role);
      setAppUser(profile);
      setAuthStage("ready");
    } catch (error) {
      console.error("role save error:", error);
      setAuthError("We couldn't save your role. Please try again.");
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAppUser(null);
    setFirebaseUser(null);
    setSubscribedRelationship(null);
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
            {partnerUser && activeRelationship && (
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

            {authError && <ErrorBanner message={authError} />}

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
          {relationshipError && (
            <div className="mb-6">
              <ErrorBanner
                message={relationshipError}
                onRetry={() => window.location.reload()}
              />
            </div>
          )}

          {appUser && firebaseUser && !activeRelationship ? (
            <ConnectionSimulator
              currentRelationship={relationship}
              onRelationshipChange={setSubscribedRelationship}
              userId={firebaseUser.uid}
              userRole={appUser.role}
            />
          ) : null}

          <nav className="flex gap-2 mb-6" aria-label="Primary">
            {PAGES.filter((entry) => !("hidden" in entry)).map((entry) => (
              <button
                aria-current={page === entry.id ? "page" : undefined}
                className={page === entry.id ? navActive : navSecondary}
                key={entry.id}
                onClick={() => navigate(entry.id)}
                type="button"
              >
                {entry.label}
              </button>
            ))}
          </nav>

          {page === "goal-log" ? (
            activeRelationship ? (
              <GoalLogPage relationshipId={activeRelationship.id} />
            ) : (
              <ConnectRequired action="logging goals" />
            )
          ) : page === "journal" ? (
            activeRelationship && firebaseUser ? (
              <JournalPage
                relationshipId={activeRelationship.id}
                userId={firebaseUser.uid}
              />
            ) : (
              <ConnectRequired action="journaling" />
            )
          ) : page === "reviews" ? (
            activeRelationship && firebaseUser && appUser ? (
              <ReviewsPage
                relationshipId={activeRelationship.id}
                userId={firebaseUser.uid}
                userRole={appUser.role}
              />
            ) : (
              <ConnectRequired action="reviewing progress" />
            )
          ) : page === "goals" ? (
            activeRelationship ? (
              <GoalsPage relationshipId={activeRelationship.id} />
            ) : (
              <ConnectRequired action="viewing goals" />
            )
          ) : page === "timeline" ? (
            activeRelationship ? (
              <TimelinePage relationshipId={activeRelationship.id} />
            ) : (
              <ConnectRequired action="using the timeline" />
            )
          ) : activeRelationship && firebaseUser && appUser?.role === "doer" ? (
            <DoerDashboard
              currentUserId={firebaseUser.uid}
              relationshipId={activeRelationship.id}
            />
          ) : activeRelationship && firebaseUser && appUser?.role === "supporter" ? (
            <SupporterDashboard
              currentUserId={firebaseUser.uid}
              relationshipId={activeRelationship.id}
            />
          ) : (
            <ConnectRequired action="to open shared support" />
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
            className="w-[min(560px,100%)] flex flex-col gap-4 p-7 rounded-3xl border border-stone-200 bg-white shadow-xl focus:outline-none"
            ref={roleDialogRef}
            role="dialog"
            tabIndex={-1}
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
