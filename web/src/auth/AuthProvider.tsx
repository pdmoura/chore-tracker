import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiRequest, ApiError } from '../lib/api';
import type { LoginResponse, User } from '../types';
import { AuthContext, type AuthContextValue } from './auth-context';

const TOKEN_STORAGE_KEY = 'chore-tracker-token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );

  const meQuery = useQuery({
    queryKey: ['auth', 'me', token],
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => {
      try {
        return await apiRequest<User>('/auth/me', { token });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
        }
        throw error;
      }
    },
  });

  const value: AuthContextValue = {
    token,
    user: meQuery.data ?? null,
    isLoading: Boolean(token && meQuery.isPending),
    async login(email, password) {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
      queryClient.setQueryData(
        ['auth', 'me', response.accessToken],
        response.user,
      );
      setToken(response.accessToken);
      return response.user;
    },
    logout() {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      queryClient.clear();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
