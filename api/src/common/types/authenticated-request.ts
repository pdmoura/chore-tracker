import { Request } from 'express';
import { SafeUser } from './safe-user';

export type AuthenticatedRequest = Request & {
  user: SafeUser;
};
