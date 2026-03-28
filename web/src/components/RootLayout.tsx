import { Link, Outlet } from "@tanstack/react-router";

export function RootLayout() {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link to="/" className="text-xl font-bold">
              Alter'd
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">
          <Outlet />
        </main>
      </div>
    );
  }