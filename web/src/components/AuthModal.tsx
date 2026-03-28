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

type AuthStep = "landing" | "signin" | "signup";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<AuthStep>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    try {
      await signIn("resend", { email: resetEmail });
      setMagicSent(true);
    } catch (err: any) {
      // Show the error from auth.ts if account doesn't exist
      setResetError(
        err?.message?.includes("No account found")
          ? "No account found with that email."
          : "Something went wrong. Try again."
      );
    }
  };

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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">

        {/* LANDING */}
        {step === "landing" && (
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Welcome to Alter'd
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Sign in or create an account to continue
              </p>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("signin")}
                className="w-full h-9 text-sm"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setStep("signup")}
                className="w-full h-9 text-sm"
              >
                Create Account
              </Button>
            </div>
          </div>
        )}

        {/* SIGN IN */}
        {step === "signin" && (
          <div className="p-8">
            <button
              onClick={() => setStep("landing")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 block"
            >
              ← Back
            </button>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Sign In
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => signIn("google")}
                className="w-full h-9 text-sm"
              >
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleSignIn} className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <Button type="submit" className="w-full h-9 text-sm mt-1">
                  Sign In →
                </Button>
              </form>

              <div className="border-t pt-4 mt-1">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  Forgot your password?
                </p>
                {magicSent ? (
                  <p className="text-xs text-center text-green-600">
                    ✓ Check your email for a sign-in link
                  </p>
                ) : (
                  <form onSubmit={handlePasswordReset} className="flex flex-col gap-2">
                    <Input
                      type="email"
                      placeholder="Your account email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      className="h-9 text-sm"
                      required
                    />
                    {resetError && <p className="text-xs text-red-500">{resetError}</p>}
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-9 text-xs w-full"
                    >
                      Send Reset Link
                    </Button>
                  </form>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                No account?{" "}
                <button onClick={() => setStep("signup")} className="underline underline-offset-2">
                  Sign up
                </button>
              </p>
            </div>
          </div>
        )}

        {/* SIGN UP */}
        {step === "signup" && (
          <div className="p-8">
            <button
              onClick={() => setStep("landing")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 block"
            >
              ← Back
            </button>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Create Account
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => signIn("google")}
                className="w-full h-9 text-sm"
              >
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleSignUp} className="flex flex-col gap-2">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-9 text-sm"
                  minLength={8}
                  required
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <Button type="submit" className="w-full h-9 text-sm mt-1">
                  Create Account →
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center">
                Already have an account?{" "}
                <button onClick={() => setStep("signin")} className="underline underline-offset-2">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}