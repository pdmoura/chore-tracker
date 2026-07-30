import { describe, expect, it } from 'vitest';
import type { User } from '@/types';
import { filterUsers, getUserStats, sortUsers } from './user-view';

const users: User[] = [
  {
    id: 'parent',
    name: 'Zoe Parent',
    email: 'zoe@example.com',
    role: 'PARENT',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'child',
    name: 'Alex Child',
    email: 'alex@example.com',
    role: 'CHILD',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

describe('user view helpers', () => {
  it('computes role summaries', () => {
    expect(getUserStats(users)).toEqual({
      total: 2,
      parents: 1,
      children: 1,
    });
  });

  it('searches name, email, and role', () => {
    expect(filterUsers(users, 'child').map((user) => user.id)).toEqual([
      'child',
    ]);
    expect(filterUsers(users, 'zoe@').map((user) => user.id)).toEqual([
      'parent',
    ]);
  });

  it('sorts without mutating the API result', () => {
    expect(sortUsers(users, 'NAME_ASC').map((user) => user.id)).toEqual([
      'child',
      'parent',
    ]);
    expect(users.map((user) => user.id)).toEqual(['parent', 'child']);
  });
});
