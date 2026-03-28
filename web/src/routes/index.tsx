import { createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import ClothingGenerator from "@/components/ClothingGen";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { isAuthenticated } = useConvexAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isAuthenticated) {
    return <ClothingGenerator />;
  }

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col items-center justify-center bg-white">
      <div className="max-w-md w-full px-8 flex flex-col gap-6">

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Alter'd</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Upload any piece of clothing and let AI generate new looks, alterations, and styling ideas.
          </p>
        </div>

        <div className="h-px bg-border w-full" />

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => setShowAuth(true)}
            className="w-full h-10"
          >
            Get Started →
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAuth(true)}
            className="w-full h-10"
          >
            Sign In
          </Button>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}