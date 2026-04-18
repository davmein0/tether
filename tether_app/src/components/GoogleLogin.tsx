import type { User } from "firebase/auth";

type Props = {
  isLoading?: boolean;
  onSignIn: () => Promise<void> | void;
  user?: User | null;
};

export default function Login({ isLoading = false, onSignIn, user }: Props) {
  return (
    <div className="login-panel">
      <button onClick={onSignIn} type="button">
        {isLoading ? "Signing in..." : user ? "Switch Google account" : "Sign in with Google"}
      </button>

      {user ? (
        <div className="login-summary">
          <p>Signed in as {user.displayName ?? user.email}</p>
          {user.photoURL ? <img alt={user.displayName ?? "User"} src={user.photoURL} /> : null}
        </div>
      ) : null}
    </div>
  );
}
