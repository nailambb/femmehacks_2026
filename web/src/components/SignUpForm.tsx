import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignUpForm({ onClose }: { onClose: () => void }) {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signIn("password", { email, password, name, flow: "signUp" });
      onClose();
      // after sign up → redirect to profile setup page
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Create Account</h2>
      <form onSubmit={handleSignUp} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded-lg px-4 py-2"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-black text-white rounded-lg py-2">
          Create Account
        </button>
      </form>
    </>
  );
}