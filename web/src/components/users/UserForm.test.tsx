import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';
import type { User } from '@/types';
import { UserForm } from './UserForm';

const parent: User = {
  id: 'parent',
  name: 'Demo Parent',
  email: 'parent@example.com',
  role: 'PARENT',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('UserForm', () => {
  it('allows role selection only during account creation', async () => {
    const interaction = userEvent.setup();
    const view = renderApp(
      <UserForm
        formId="create-user"
        isSubmitting={false}
        error=""
        onSubmit={() => Promise.resolve()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Child' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await interaction.click(screen.getByRole('button', { name: 'Parent' }));
    expect(screen.getByRole('button', { name: 'Parent' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    view.unmount();
    renderApp(
      <UserForm
        formId="edit-user"
        user={parent}
        isSubmitting={false}
        error=""
        onSubmit={() => Promise.resolve()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Parent' })).toBeNull();
    expect(screen.getByText('Role is permanent')).toBeVisible();
  });
});
