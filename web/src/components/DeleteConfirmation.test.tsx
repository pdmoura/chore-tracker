import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '@/test/render';
import { DeleteConfirmation } from './DeleteConfirmation';

describe('DeleteConfirmation', () => {
  it('requires an explicit destructive confirmation', async () => {
    const onConfirm = vi.fn();
    const interaction = userEvent.setup();
    renderApp(
      <DeleteConfirmation
        open
        onOpenChange={() => undefined}
        title="Delete task?"
        description="This cannot be undone."
        isDeleting={false}
        onConfirm={onConfirm}
      />,
    );

    await interaction.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.getByRole('alertdialog')).toBeVisible();
  });

  it('locks cancellation and confirmation while deletion is pending', () => {
    renderApp(
      <DeleteConfirmation
        open
        onOpenChange={() => undefined}
        title="Delete task?"
        description="This cannot be undone."
        isDeleting
        onConfirm={() => undefined}
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Deleting…' })).toBeDisabled();
  });
});
