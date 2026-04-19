import type { User } from "firebase/auth";

type Props = {
  isLoading?: boolean;
  onSignIn: () => Promise<void> | void;
  user?: User | null;
};

export default function Login({ isLoading = false, onSignIn, user }: Props) {
  return (
    <div className="flex flex-col gap-2 items-end">
      <button
        className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0"
        onClick={onSignIn}
        type="button"
      >
        {isLoading ? "Signing in..." : user ? "Switch Google account" : "Sign in with Google"}
      </button>

      {user ? (
        <div className="flex items-center gap-2.5 text-stone-600 text-sm">
          <p>Signed in as {user.displayName ?? user.email}</p>
          {user.photoURL ? (
            <img
              alt={user.displayName ?? "User"}
              className="w-9 h-9 rounded-full object-cover"
              src={user.photoURL}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
