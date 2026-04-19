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
        className="border-0 rounded-full px-[18px] py-3 bg-[linear-gradient(135deg,#b45309,#7c2d12)] text-[#fff9f1] font-bold transition-transform duration-[140ms] hover:translate-y-[-1px] hover:[box-shadow:0_12px_24px_rgba(124,45,18,0.16)]"
        onClick={onSignIn}
        type="button"
      >
        {isLoading ? "Signing in..." : user ? "Switch Google account" : "Sign in with Google"}
      </button>

      {user ? (
        <div className="flex items-center gap-[10px] text-[#8a7461] text-[0.92rem]">
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
