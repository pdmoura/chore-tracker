import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiRequest, ApiError, getErrorMessage } from '../lib/api';
import type { LoginResponse, User } from '../types';
import { AuthContext, type AuthContextValue } from './auth-context';

const TOKEN_STORAGE_KEY = 'chore-tracker-token';
const SESSION_TIMEOUT_MS = 15_000;

function getStoredToken(): string | null {
  return (
    localStorage.getItem(TOKEN_STORAGE_KEY) ??
    sessionStorage.getItem(TOKEN_STORAGE_KEY)
  );
}

function clearStoredTokens(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(getStoredToken);

  const meQuery = useQuery({
    queryKey: ['auth', 'me', token],
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => {
      try {
        return await apiRequest<User>('/auth/me', {
          token,
          timeoutMs: SESSION_TIMEOUT_MS,
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearStoredTokens();
          setToken(null);
        }
        throw error;
      }
    },
  });

  const sessionStatus: AuthContextValue['sessionStatus'] = !token
    ? 'anonymous'
    : meQuery.isFetching
      ? 'checking'
      : meQuery.data
        ? 'authenticated'
        : meQuery.isError
          ? 'error'
          : 'checking';

  const value: AuthContextValue = {
    token,
    user: meQuery.data ?? null,
    sessionStatus,
    sessionError:
      sessionStatus === 'error' ? getErrorMessage(meQuery.error) : null,
    async login(email, password, rememberMe) {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      clearStoredTokens();
      (rememberMe ? localStorage : sessionStorage).setItem(
        TOKEN_STORAGE_KEY,
        response.accessToken,
      );
      queryClient.setQueryData(
        ['auth', 'me', response.accessToken],
        response.user,
      );
      setToken(response.accessToken);
      return response.user;
    },
    async retrySession() {
      await meQuery.refetch();
    },
    logout() {
      clearStoredTokens();
      setToken(null);
      queryClient.clear();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
