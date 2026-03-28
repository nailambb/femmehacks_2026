import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type AuthStep = "landing" | "signin" | "signup";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<AuthStep>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signIn("password", { email, password, flow: "signIn" });
      onClose();
    } catch {
      setError("Invalid email or password.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signIn("password", { email, password, name, flow: "signUp" });
      onClose();
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signIn("resend", { email });
      setMagicSent(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">

        {step === "landing" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Welcome to Alter'd</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <Button variant="outline" onClick={() => setStep("signin")} className="w-full">
                Sign In
              </Button>
              <Button onClick={() => setStep("signup")} className="w-full">
                Create Account
              </Button>
            </div>
          </>
        )}

        {step === "signin" && (
          <>
            <DialogHeader>
              <button onClick={() => setStep("landing")} className="text-sm text-muted-foreground text-left mb-1">
                ← Back
              </button>
              <DialogTitle className="text-2xl">Sign In</DialogTitle>
            </DialogHeader>

            <Button variant="outline" onClick={() => signIn("google")} className="w-full">
              Continue with Google
            </Button>

            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or sign in with email</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">Sign In</Button>
            </form>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Forgot password? Use a magic link instead
              </p>
              {magicSent ? (
                <p className="text-green-600 text-sm text-center">✓ Check your email!</p>
              ) : (
                <form onSubmit={handleMagicLink} className="flex gap-2">
                  <Input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required />
                  <Button type="submit" variant="outline" className="whitespace-nowrap">Send Link</Button>
                </form>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Don't have an account?{" "}
              <button onClick={() => setStep("signup")} className="underline">Sign up</button>
            </p>
          </>
        )}

        {step === "signup" && (
          <>
            <DialogHeader>
              <button onClick={() => setStep("landing")} className="text-sm text-muted-foreground text-left mb-1">
                ← Back
              </button>
              <DialogTitle className="text-2xl">Create Account</DialogTitle>
            </DialogHeader>

            <Button variant="outline" onClick={() => signIn("google")} className="w-full">
              Sign up with Google
            </Button>

            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or sign up with email</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
              <Input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
              <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input type="password" placeholder="Password (min 8 characters)" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">Create Account</Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{" "}
              <button onClick={() => setStep("signin")} className="underline">Sign in</button>
            </p>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}