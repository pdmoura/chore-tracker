import type { User } from '@/types';

export type UserSort =
  | 'DEFAULT'
  | 'NAME_ASC'
  | 'NAME_DESC'
  | 'EMAIL_ASC'
  | 'EMAIL_DESC'
  | 'ROLE_ASC'
  | 'ROLE_DESC'
  | 'CREATED_ASC'
  | 'CREATED_DESC';

export function getUserStats(users: User[]) {
  return {
    total: users.length,
    parents: users.filter((user) => user.role === 'PARENT').length,
    children: users.filter((user) => user.role === 'CHILD').length,
  };
}

export function filterUsers(users: User[], search: string): User[] {
  const normalizedSearch = search.trim().toLocaleLowerCase('en-US');
  if (!normalizedSearch) return users;

  return users.filter(
    (user) =>
      user.name.toLocaleLowerCase('en-US').includes(normalizedSearch) ||
      user.email.toLocaleLowerCase('en-US').includes(normalizedSearch) ||
      user.role.toLocaleLowerCase('en-US').includes(normalizedSearch),
  );
}

export function sortUsers(users: User[], sort: UserSort): User[] {
  const sorted = [...users];
  const compareText = (field: 'name' | 'email' | 'role') =>
    (left: User, right: User) =>
      left[field].localeCompare(right[field], 'en-US');
  const compareCreated = (left: User, right: User) =>
    new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();

  if (sort === 'NAME_ASC') sorted.sort(compareText('name'));
  if (sort === 'NAME_DESC')
    sorted.sort((a, b) => compareText('name')(b, a));
  if (sort === 'EMAIL_ASC') sorted.sort(compareText('email'));
  if (sort === 'EMAIL_DESC')
    sorted.sort((a, b) => compareText('email')(b, a));
  if (sort === 'ROLE_ASC') sorted.sort(compareText('role'));
  if (sort === 'ROLE_DESC')
    sorted.sort((a, b) => compareText('role')(b, a));
  if (sort === 'CREATED_ASC') sorted.sort(compareCreated);
  if (sort === 'CREATED_DESC') sorted.sort((a, b) => compareCreated(b, a));
  return sorted;
}
