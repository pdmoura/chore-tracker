import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ErrorMessage } from '../components/ErrorMessage';
import { getErrorMessage } from '../lib/api';

export function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <div className="page-status">Checking your session…</div>;
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
      const authenticatedUser = await login(email, password);
      await navigate(
        authenticatedUser.role === 'PARENT' ? '/admin/tasks' : '/my-tasks',
        { replace: true },
      );
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div>
          <span className="eyebrow">Welcome home</span>
          <h1 id="login-title">Chore Tracker</h1>
          <p>Sign in to manage family chores or check your assigned tasks.</p>
        </div>

        {error ? <ErrorMessage title="Unable to sign in" message={error} /> : null}

        <form onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="button button-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <aside className="demo-note">
          <strong>Demo accounts</strong>
          <span>Parent: parent@example.com / Parent123!</span>
          <span>Child: child@example.com / Child123!</span>
        </aside>
      </section>
    </main>
  );
}
