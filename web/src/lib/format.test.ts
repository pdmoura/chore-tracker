import { describe, expect, it } from 'vitest';
import { formatDate, formatWeekday } from './format';

describe('date formatting', () => {
  it('uses deterministic American English labels', () => {
    const value = '2026-07-30T12:00:00.000Z';
    expect(formatDate(value)).toMatch(/Jul 30, 2026/);
    expect(formatWeekday(value)).toBe('Thu');
  });
});
