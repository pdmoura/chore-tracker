import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';
import { server } from '@/test/server';
import type { User } from '@/types';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

const tokenKey = 'chore-tracker-token';
const parent: User = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Demo Parent',
  email: 'parent@example.com',
  role: 'PARENT',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function AuthProbe({ rememberMe = true }: { rememberMe?: boolean }) {
  const {
    sessionStatus,
    login,
    retrySession,
    logout,
  } = useAuth();

  return (
    <div>
      <span>{sessionStatus}</span>
      <button
        type="button"
        onClick={() =>
          void login('parent@example.com', 'Parent123!', rememberMe)
        }
      >
        Log in
      </button>
      <button type="button" onClick={() => void retrySession()}>
        Retry
      </button>
      <button type="button" onClick={logout}>
        Log out
      </button>
    </div>
  );
}

function renderAuth(rememberMe = true) {
  return renderApp(
    <AuthProvider>
      <AuthProbe rememberMe={rememberMe} />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  it.each([
    { rememberMe: true, storage: 'local' },
    { rememberMe: false, storage: 'session' },
  ])('stores a successful login in $storage storage', async ({
    rememberMe,
    storage,
  }) => {
    server.use(
      http.post('http://localhost:3000/api/auth/login', () =>
        HttpResponse.json({
          accessToken: 'signed-token',
          user: parent,
        }),
      ),
    );
    const user = userEvent.setup();
    renderAuth(rememberMe);

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    await screen.findByText('authenticated');
    expect(
      (storage === 'local' ? localStorage : sessionStorage).getItem(tokenKey),
    ).toBe('signed-token');
    expect(
      (storage === 'local' ? sessionStorage : localStorage).getItem(tokenKey),
    ).toBeNull();
  });

  it('preserves the token after a server error and recovers on retry', async () => {
    localStorage.setItem(tokenKey, 'saved-token');
    let requestCount = 0;
    server.use(
      http.get('http://localhost:3000/api/auth/me', () => {
        requestCount += 1;
        return requestCount === 1
          ? HttpResponse.json({ message: 'Unavailable' }, { status: 503 })
          : HttpResponse.json(parent);
      }),
    );
    const user = userEvent.setup();
    renderAuth();

    await screen.findByText('error');
    expect(localStorage.getItem(tokenKey)).toBe('saved-token');

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await screen.findByText('authenticated');
    expect(localStorage.getItem(tokenKey)).toBe('saved-token');
  });

  it('clears both stores when session restoration returns 401', async () => {
    localStorage.setItem(tokenKey, 'expired-token');
    sessionStorage.setItem(tokenKey, 'stale-token');
    server.use(
      http.get('http://localhost:3000/api/auth/me', () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );
    renderAuth();

    await waitFor(() => expect(screen.getByText('anonymous')).toBeVisible());
    expect(localStorage.getItem(tokenKey)).toBeNull();
    expect(sessionStorage.getItem(tokenKey)).toBeNull();
  });
});
