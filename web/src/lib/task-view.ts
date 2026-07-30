import type { Task } from '@/types';

export type TaskStatusFilter = 'ALL' | 'PENDING' | 'COMPLETED';
export type TaskSort =
  | 'DEFAULT'
  | 'TITLE_ASC'
  | 'TITLE_DESC'
  | 'DUE_ASC'
  | 'DUE_DESC';

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function isDueToday(task: Task, now = new Date()): boolean {
  if (!task.dueDate || task.completedAt) return false;
  return (
    startOfLocalDay(new Date(task.dueDate)).getTime() ===
    startOfLocalDay(now).getTime()
  );
}

export function isDueSoon(task: Task, now = new Date()): boolean {
  if (!task.dueDate || task.completedAt) return false;
  const today = startOfLocalDay(now);
  const end = new Date(today);
  end.setDate(end.getDate() + 3);
  const dueDate = startOfLocalDay(new Date(task.dueDate));
  return dueDate >= today && dueDate <= end;
}

export function getTaskStats(tasks: Task[], now = new Date()) {
  return {
    total: tasks.length,
    pending: tasks.filter((task) => !task.completedAt).length,
    completed: tasks.filter((task) => task.completedAt).length,
    dueSoon: tasks.filter((task) => isDueSoon(task, now)).length,
    dueToday: tasks.filter((task) => isDueToday(task, now)).length,
  };
}

export function filterTasks(
  tasks: Task[],
  {
    search,
    status,
    assigneeId,
  }: {
    search: string;
    status: TaskStatusFilter;
    assigneeId: string;
  },
): Task[] {
  const normalizedSearch = search.trim().toLocaleLowerCase('en-US');

  return tasks.filter((task) => {
    const matchesSearch =
      !normalizedSearch ||
      task.title.toLocaleLowerCase('en-US').includes(normalizedSearch) ||
      (task.description ?? '')
        .toLocaleLowerCase('en-US')
        .includes(normalizedSearch) ||
      task.assignedTo.name
        .toLocaleLowerCase('en-US')
        .includes(normalizedSearch);
    const matchesStatus =
      status === 'ALL' ||
      (status === 'COMPLETED' ? Boolean(task.completedAt) : !task.completedAt);
    const matchesAssignee =
      assigneeId === 'ALL' || task.assignedToId === assigneeId;

    return matchesSearch && matchesStatus && matchesAssignee;
  });
}

export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const sorted = [...tasks];
  const titleCompare = (left: Task, right: Task) =>
    left.title.localeCompare(right.title, 'en-US');
  const dueCompare = (left: Task, right: Task) => {
    if (!left.dueDate && !right.dueDate) return 0;
    if (!left.dueDate) return 1;
    if (!right.dueDate) return -1;
    return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
  };

  if (sort === 'TITLE_ASC') sorted.sort(titleCompare);
  if (sort === 'TITLE_DESC') sorted.sort((a, b) => titleCompare(b, a));
  if (sort === 'DUE_ASC') sorted.sort(dueCompare);
  if (sort === 'DUE_DESC') sorted.sort((a, b) => dueCompare(b, a));
  return sorted;
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    firstItem: items.length === 0 ? 0 : start + 1,
    lastItem: Math.min(start + pageSize, items.length),
  };
}

export function canChildManageTask(
  task: Pick<Task, 'assignedToId' | 'createdById'>,
  userId: string | undefined,
): boolean {
  return Boolean(
    userId &&
      task.assignedToId === userId &&
      task.createdById === userId,
  );
}
