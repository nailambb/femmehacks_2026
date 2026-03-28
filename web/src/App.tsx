import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { AuthModal } from "./components/AuthModal";
import ClothingGen from "./components/ClothingGen";

export default function App() {
  const { isAuthenticated } = useConvexAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div>
      {!isAuthenticated && (
        <button onClick={() => setShowAuth(true)}>
          Sign In / Sign Up
        </button>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {isAuthenticated && <p>You're logged in!</p> && <ClothingGen />}
    </div>
  );
}
