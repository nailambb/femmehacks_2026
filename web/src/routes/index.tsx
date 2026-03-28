import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { isAuthenticated } = useConvexAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to Alter'd</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p className="mb-6">Your AI-powered clothing alteration assistant.</p>
          {!isAuthenticated && (
            <Button onClick={() => setShowAuth(true)} className="w-full">
              Get Started
            </Button>
          )}
        </CardContent>
      </Card>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}