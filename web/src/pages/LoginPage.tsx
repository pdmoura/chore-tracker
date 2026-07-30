import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';
import familyIllustration from '@/assets/chore-tracker-family-cartoon.png';
import { useAuth } from '@/auth/useAuth';
import { BrandLogo } from '@/components/BrandLogo';
import { ErrorMessage } from '@/components/ErrorMessage';
import { SessionStatusScreen } from '@/components/SessionStatusScreen';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage, warmApi } from '@/lib/api';

export function LoginPage() {
  const { user, sessionStatus, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWarmupPending, setIsWarmupPending] = useState(true);
  const [isWaitingForWarmup, setIsWaitingForWarmup] = useState(false);

  useEffect(() => {
    let active = true;
    void warmApi().then(() => {
      if (active) setIsWarmupPending(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (sessionStatus === 'checking' || sessionStatus === 'error') {
    return <SessionStatusScreen />;
  }

  if (user) {
    return (
      <Navigate
        to={user.role === 'PARENT' ? '/admin/tasks' : '/my-tasks'}
        replace
      />
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isWarmupPending) {
        setIsWaitingForWarmup(true);
        await warmApi();
        setIsWarmupPending(false);
        setIsWaitingForWarmup(false);
      }

      const authenticatedUser = await login(email, password, rememberMe);
      await navigate(
        authenticatedUser.role === 'PARENT' ? '/admin/tasks' : '/my-tasks',
        { replace: true },
      );
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setIsWaitingForWarmup(false);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(28rem,0.82fr)_1.18fr]">
      <section className="relative overflow-hidden border-b border-border bg-primary/[0.025] px-6 pb-0 pt-7 dark:bg-primary/[0.04] sm:px-10 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-14 lg:py-12">
        <BrandLogo />
        <div className="mt-10 max-w-xl lg:mt-14">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            A better way to manage family chores
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
            Stay organized, build responsibility, and keep your home running
            smoothly—together.
          </p>

          <div className="mt-9 hidden space-y-6 sm:block">
            <Feature
              icon={ClipboardList}
              tone="blue"
              title="Assign chores"
              description="Quickly assign tasks to the right family members."
            />
            <Feature
              icon={CheckCircle2}
              tone="green"
              title="Track completion"
              description="See what’s done, what’s pending, and what’s next."
            />
            <Feature
              icon={UsersRound}
              tone="violet"
              title="Manage family tasks"
              description="Keep everyone on the same page and build great habits."
            />
          </div>
        </div>

        <img
          src={familyIllustration}
          alt="A family organizing chores together on a tablet"
          className="mx-auto mt-8 w-full max-w-2xl object-contain lg:absolute lg:inset-x-6 lg:bottom-0 lg:mt-0"
        />
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
        <ThemeToggle className="absolute right-5 top-5 w-48 sm:right-8 sm:top-8" />
        <div className="w-full max-w-2xl space-y-5 pt-16">
          <Card className="p-6 shadow-card sm:p-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Welcome back! Please sign in to continue.
              </p>
            </div>

            {isWaitingForWarmup ? (
              <div
                className="mt-8 grid min-h-72 place-items-center rounded-xl border border-primary/20 bg-primary/5 p-6 text-center"
                role="status"
                aria-live="polite"
              >
                <div>
                  <LoaderCircle
                    className="mx-auto size-10 animate-spin text-primary motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <strong className="mt-5 block">Waking the demo server…</strong>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    The free demo server may take up to one minute to start. Your
                    sign-in will continue automatically.
                  </p>
                </div>
              </div>
            ) : (
              <form
                className="mt-8 grid gap-5"
                onSubmit={(event) => void handleSubmit(event)}
              >
                {error ? (
                  <ErrorMessage title="Unable to sign in" message={error} />
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="pl-11"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <LockKeyhole
                      className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="px-11"
                      disabled={isSubmitting}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" />
                      ) : (
                        <Eye aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>

                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-input accent-primary"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  Remember me
                </label>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>

                <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                  <ShieldCheck aria-hidden="true" />
                  Your credentials are sent securely to the Chore Tracker API.
                </p>
              </form>
            )}
          </Card>

          <Alert variant="info">
            <UserRound aria-hidden="true" />
            <AlertTitle>Accounts are created by a Parent</AlertTitle>
            <AlertDescription>
              If you need access, ask a Parent to create an account for you.
            </AlertDescription>
          </Alert>

          <Card className="p-5">
            <h2 className="font-semibold">Demo credentials</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use either account to explore the role-specific experience.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <DemoCredential
                role="Parent"
                email="parent@example.com"
                password="Parent123!"
                tone="blue"
              />
              <DemoCredential
                role="Child"
                email="child@example.com"
                password="Child123!"
                tone="green"
              />
            </div>
            <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <Info className="mt-0.5 shrink-0" aria-hidden="true" />
              Demo data may be reset when the server restarts.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon: Icon,
  tone,
  title,
  description,
}: {
  icon: typeof ClipboardList;
  tone: 'blue' | 'green' | 'violet';
  title: string;
  description: string;
}) {
  const toneClass = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  }[tone];

  return (
    <div className="flex items-start gap-4">
      <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${toneClass}`}>
        <Icon aria-hidden="true" />
      </span>
      <div>
        <strong>{title}</strong>
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function DemoCredential({
  role,
  email,
  password,
  tone,
}: {
  role: string;
  email: string;
  password: string;
  tone: 'blue' | 'green';
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${
          tone === 'blue' ? 'bg-blue-600' : 'bg-green-600'
        }`}
        aria-hidden="true"
      >
        {role[0]}
      </span>
      <div className="min-w-0 text-sm">
        <strong>{role}</strong>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 text-xs">
          <dt className="text-muted-foreground">Email:</dt>
          <dd className="truncate">{email}</dd>
          <dt className="text-muted-foreground">Password:</dt>
          <dd>{password}</dd>
        </dl>
      </div>
    </div>
  );
}
