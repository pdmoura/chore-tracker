import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('switches and persists the selected theme', async () => {
    const user = userEvent.setup();
    renderApp(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Dark' }));

    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('chore-tracker-theme')).toBe('dark');
  });
});
