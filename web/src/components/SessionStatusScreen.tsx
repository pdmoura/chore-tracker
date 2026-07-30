import { LoaderCircle, LogOut, RefreshCw, WifiOff } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { Button } from './ui/button';

export function SessionStatusScreen() {
  const { sessionStatus, sessionError, retrySession, logout } = useAuth();

  if (sessionStatus === 'checking') {
    return (
      <main
        className="grid min-h-screen place-items-center bg-background px-6"
        role="status"
        aria-live="polite"
      >
        <div className="grid justify-items-center gap-4 text-center">
          <LoaderCircle
            className="size-8 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
          <div>
            <h1 className="text-lg font-semibold">Checking your session…</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This should only take a moment.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (sessionStatus !== 'error') {
    return null;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <WifiOff aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-bold">We couldn’t restore your session</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {sessionError ??
            'The server could not be reached. Your saved session is still safe.'}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button onClick={() => void retrySession()}>
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
          <Button variant="outline" onClick={logout}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </section>
    </main>
  );
}
