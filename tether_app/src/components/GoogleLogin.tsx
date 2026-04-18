import { useState } from "react";
import type { User } from "firebase/auth";
import { signInWithGoogle } from "../auth";

export default function Login() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async () => {
    const result = await signInWithGoogle();
    if (result) setUser(result);
  };

  return (
    <div>
      <button onClick={handleLogin}>Sign in with Google</button>

      {user && (
        <div>
          <p>Welcome, {user.displayName}</p>
          <img src={user.photoURL ?? ""} />
        </div>
      )}
    </div>
  );
}
