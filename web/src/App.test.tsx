import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';
import { server } from '@/test/server';
import type { User } from '@/types';
import { App } from './App';

const baseUser: User = {
  id: 'user',
  name: 'Demo User',
  email: 'user@example.com',
  role: 'PARENT',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function mockAuthenticatedApp(user: User) {
  localStorage.setItem('chore-tracker-token', 'valid-token');
  server.use(
    http.get('http://localhost:3000/api/auth/me', () =>
      HttpResponse.json(user),
    ),
    http.get('http://localhost:3000/api/tasks', () => HttpResponse.json([])),
    http.get('http://localhost:3000/api/users', () =>
      HttpResponse.json([user]),
    ),
  );
}

describe('role routes', () => {
  it('redirects a Parent away from the Child route', async () => {
    mockAuthenticatedApp(baseUser);
    renderApp(<App />, { route: '/my-tasks' });

    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: 'Tasks' },
        { timeout: 5_000 },
      ),
    ).toBeVisible();
  });

  it('redirects a Child away from Parent routes', async () => {
    mockAuthenticatedApp({ ...baseUser, role: 'CHILD' });
    renderApp(<App />, { route: '/admin/users' });

    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: 'My tasks' },
        { timeout: 5_000 },
      ),
    ).toBeVisible();
  });
});
