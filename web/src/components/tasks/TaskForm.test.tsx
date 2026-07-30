import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';
import type { User } from '@/types';
import { TaskForm } from './TaskForm';

const child: User = {
  id: 'child',
  name: 'Demo Child',
  email: 'child@example.com',
  role: 'CHILD',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TaskForm', () => {
  it('does not expose assignment controls for a Child task', () => {
    renderApp(
      <TaskForm
        formId="child-task"
        selfAssigned
        isSubmitting={false}
        error=""
        onSubmit={() => Promise.resolve()}
      />,
    );

    expect(screen.queryByText('Assign to child')).toBeNull();
    expect(screen.getByLabelText(/Task title/)).toBeVisible();
  });

  it('requires an assignee for a Parent task', () => {
    renderApp(
      <TaskForm
        formId="parent-task"
        children={[child]}
        isSubmitting={false}
        error=""
        onSubmit={() => Promise.resolve()}
      />,
    );

    expect(screen.getByText('Assign to child')).toBeVisible();
    expect(screen.getByRole('combobox')).toHaveTextContent('Demo Child');
  });
});
