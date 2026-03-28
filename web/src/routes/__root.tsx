import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { NavBar } from "../components/NavBar";

function RootLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  console.log("auth state:", { isAuthenticated, isLoading });

  return (
    <>
      <NavBar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});