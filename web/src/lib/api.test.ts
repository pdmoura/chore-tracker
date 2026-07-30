import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/server';
import { apiRequest, ApiTimeoutError } from './api';

describe('apiRequest', () => {
  it('raises a dedicated timeout error', async () => {
    server.use(
      http.get('http://localhost:3000/api/slow', async () => {
        await delay('infinite');
        return HttpResponse.json({ ok: true });
      }),
    );

    await expect(
      apiRequest('/slow', { timeoutMs: 10 }),
    ).rejects.toBeInstanceOf(ApiTimeoutError);
  });
});
