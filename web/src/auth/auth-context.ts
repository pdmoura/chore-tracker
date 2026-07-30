import { createContext } from 'react';
import type { User } from '../types';

export type SessionStatus =
  | 'checking'
  | 'authenticated'
  | 'anonymous'
  | 'error';

export interface AuthContextValue {
  token: string | null;
  user: User | null;
  sessionStatus: SessionStatus;
  sessionError: string | null;
  login: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<User>;
  retrySession: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
