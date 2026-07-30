const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api')
  .trim()
  .replace(/\/$/, '');
const API_HEALTH_TIMEOUT_MS = 65_000;

let apiWarmupPromise: Promise<boolean> | undefined;

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  timeoutMs?: number;
}

interface ErrorPayload {
  message?: string | string[];
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super('The request timed out. Please try again.');
    this.name = 'ApiTimeoutError';
  }
}

export function warmApi(): Promise<boolean> {
  apiWarmupPromise ??= checkApiHealth();
  return apiWarmupPromise;
}

export function getApiHealthUrl(): string {
  const apiUrl = new URL(API_URL, window.location.origin);
  return `${apiUrl.origin}/health`;
}

async function checkApiHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    API_HEALTH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(getApiHealthUrl(), {
      cache: 'no-store',
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const controller = new AbortController();
  let didTimeout = false;
  const timeoutId =
    options.timeoutMs === undefined
      ? undefined
      : window.setTimeout(() => {
          didTimeout = true;
          controller.abort();
        }, options.timeoutMs);
  const headers = new Headers();
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch (error) {
    if (didTimeout && options.timeoutMs !== undefined) {
      throw new ApiTimeoutError(options.timeoutMs);
    }
    throw error;
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ErrorPayload;
    const message = Array.isArray(payload.message)
      ? payload.message.join(' ')
      : (payload.message ?? `Request failed with status ${response.status}`);

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Please try again.';
}
