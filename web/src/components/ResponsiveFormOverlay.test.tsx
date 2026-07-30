import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '@/test/render';
import { ResponsiveFormOverlay } from './ResponsiveFormOverlay';

function setDesktop(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(min-width: 768px)' ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function renderOverlay() {
  renderApp(
    <ResponsiveFormOverlay
      open
      onOpenChange={() => undefined}
      title="Create task"
      description="Add a task."
      isBusy={false}
      footer={<button type="button">Save</button>}
    >
      <label>
        Title
        <input />
      </label>
    </ResponsiveFormOverlay>,
  );
}

describe('ResponsiveFormOverlay', () => {
  it('uses a right-side sheet on desktop', async () => {
    setDesktop(true);
    renderOverlay();

    expect(await screen.findByRole('dialog')).toHaveAttribute(
      'data-slot',
      'sheet-content',
    );
  });

  it('uses a bottom drawer on mobile', async () => {
    setDesktop(false);
    renderOverlay();

    expect(await screen.findByRole('dialog')).toHaveAttribute(
      'data-slot',
      'drawer-content',
    );
  });
});
