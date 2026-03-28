import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import { AuthModal } from "./AuthModal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavBar() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [showAuth, setShowAuth] = useState(false);

  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  const displayName = user?.name ?? "there";
  const displayInitial = user?.name?.[0]?.toUpperCase() ?? "?";
  const displayImage = user?.image ?? "";
  const displayEmail = user?.email ?? "";

  return (
    <>
      <nav className="h-[57px] border-b px-8 flex items-center justify-between bg-white">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          Alter'd
        </Link>

        <div className="flex items-center gap-6">
          {isLoading || (isAuthenticated && user === undefined) ? (
            <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-7 w-7 cursor-pointer">
                  <AvatarImage src={displayImage} alt={displayName} />
                  <AvatarFallback className="text-xs bg-muted">
                    {displayInitial}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profilepage" className="cursor-pointer w-full text-sm">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-sm text-red-500 cursor-pointer focus:text-red-500"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => setShowAuth(true)}
              size="sm"
              className="h-8 px-4 text-xs"
            >
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}