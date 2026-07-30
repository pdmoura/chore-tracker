import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';
import { useTheme } from './useTheme';

function ThemeProbe() {
  const { theme, setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme('dark')}>
      Theme: {theme}
    </button>
  );
}

describe('ThemeProvider', () => {
  it('persists an explicit theme selection', async () => {
    const user = userEvent.setup();
    renderApp(<ThemeProbe />);

    await user.click(screen.getByRole('button', { name: 'Theme: light' }));

    expect(screen.getByRole('button', { name: 'Theme: dark' })).toBeVisible();
    expect(localStorage.getItem('chore-tracker-theme')).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');
  });
});
