import { describe, expect, it } from 'vitest';
import type { Task, User } from '@/types';
import {
  canChildManageTask,
  filterTasks,
  getTaskStats,
  paginate,
  sortTasks,
} from './task-view';

const parent: User = {
  id: 'parent',
  name: 'Demo Parent',
  email: 'parent@example.com',
  role: 'PARENT',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const child: User = {
  ...parent,
  id: 'child',
  name: 'Demo Child',
  email: 'child@example.com',
  role: 'CHILD',
};

function task(overrides: Partial<Task>): Task {
  return {
    id: 'task',
    title: 'Tidy the room',
    description: 'Put away toys',
    dueDate: null,
    assignedToId: child.id,
    createdById: parent.id,
    completedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    assignedTo: child,
    createdBy: parent,
    ...overrides,
  };
}

describe('task view helpers', () => {
  it('computes completion and local due-date summaries', () => {
    const now = new Date(2026, 6, 30, 12);
    const tasks = [
      task({ id: 'today', dueDate: new Date(2026, 6, 30, 18).toISOString() }),
      task({ id: 'soon', dueDate: new Date(2026, 7, 2, 9).toISOString() }),
      task({
        id: 'done',
        dueDate: new Date(2026, 6, 30, 9).toISOString(),
        completedAt: now.toISOString(),
      }),
    ];

    expect(getTaskStats(tasks, now)).toEqual({
      total: 3,
      pending: 2,
      completed: 1,
      dueSoon: 2,
      dueToday: 1,
    });
  });

  it('searches title, description, and assignee before sorting', () => {
    const tasks = [
      task({ id: 'b', title: 'Wash dishes' }),
      task({ id: 'a', title: 'Clean room', description: 'Bedroom' }),
    ];
    const filtered = filterTasks(tasks, {
      search: 'demo child',
      status: 'PENDING',
      assigneeId: child.id,
    });

    expect(sortTasks(filtered, 'TITLE_ASC').map((item) => item.id)).toEqual([
      'a',
      'b',
    ]);
  });

  it('paginates safely when the requested page exceeds the result set', () => {
    expect(paginate([1, 2, 3, 4, 5, 6], 4, 5)).toEqual({
      items: [6],
      page: 2,
      pageCount: 2,
      firstItem: 6,
      lastItem: 6,
    });
  });

  it('allows children to manage only self-created assigned tasks', () => {
    expect(
      canChildManageTask(
        { assignedToId: child.id, createdById: child.id },
        child.id,
      ),
    ).toBe(true);
    expect(
      canChildManageTask(
        { assignedToId: child.id, createdById: parent.id },
        child.id,
      ),
    ).toBe(false);
  });
});
