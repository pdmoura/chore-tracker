import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PageHeader } from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';
import { ResponsiveFormOverlay } from '@/components/ResponsiveFormOverlay';
import { SearchField } from '@/components/SearchField';
import { StatCard } from '@/components/StatCard';
import { UserAvatar } from '@/components/UserAvatar';
import {
  TaskForm,
  type TaskFormValues,
} from '@/components/tasks/TaskForm';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiRequest, getErrorMessage } from '@/lib/api';
import { formatDate, formatWeekday } from '@/lib/format';
import {
  filterTasks,
  getTaskStats,
  paginate,
  sortTasks,
  type TaskSort,
  type TaskStatusFilter,
} from '@/lib/task-view';
import { cn } from '@/lib/utils';
import type { Task, User } from '@/types';

type FormState = { mode: 'create' } | { mode: 'edit'; task: Task } | null;
const pageSize = 5;
const taskFormId = 'parent-task-form';

export function TasksPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatusFilter>('ALL');
  const [assigneeId, setAssigneeId] = useState('ALL');
  const [sort, setSort] = useState<TaskSort>('DEFAULT');
  const [page, setPage] = useState(1);

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiRequest<Task[]>('/tasks', { token }),
  });
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => apiRequest<User[]>('/users', { token }),
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      values,
      editing,
    }: {
      values: TaskFormValues;
      editing?: Task;
    }) => {
      const body = {
        title: values.title,
        description: values.description || null,
        dueDate: values.dueDate
          ? new Date(values.dueDate).toISOString()
          : null,
        assignedToId: values.assignedToId!,
      };
      return editing
        ? apiRequest<Task>(`/tasks/${editing.id}`, {
            method: 'PATCH',
            token,
            body,
          })
        : apiRequest<Task>('/tasks', { method: 'POST', token, body });
    },
    onSuccess: async () => {
      setFormState(null);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/tasks/${id}`, { method: 'DELETE', token }),
    onSuccess: async () => {
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const completionMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      apiRequest<Task>(`/tasks/${id}/completion`, {
        method: 'PATCH',
        token,
        body: { completed },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const tasks = tasksQuery.data ?? [];
  const children = (usersQuery.data ?? []).filter(
    (user) => user.role === 'CHILD',
  );
  const stats = getTaskStats(tasks);
  const visibleTasks = sortTasks(
    filterTasks(tasks, { search, status, assigneeId }),
    sort,
  );
  const pagination = paginate(visibleTasks, page, pageSize);
  const pageError = deleteMutation.isError
    ? getErrorMessage(deleteMutation.error)
    : completionMutation.isError
      ? getErrorMessage(completionMutation.error)
      : '';

  function updateFilter(update: () => void) {
    update();
    setPage(1);
  }

  function toggleSort(column: 'title' | 'due') {
    setSort((current) => {
      if (column === 'title') {
        return current === 'TITLE_ASC' ? 'TITLE_DESC' : 'TITLE_ASC';
      }
      return current === 'DUE_ASC' ? 'DUE_DESC' : 'DUE_ASC';
    });
    setPage(1);
  }

  async function handleSave(values: TaskFormValues) {
    saveMutation.reset();
    await saveMutation.mutateAsync({
      values,
      editing: formState?.mode === 'edit' ? formState.task : undefined,
    });
  }

  const editingTask =
    formState?.mode === 'edit' ? formState.task : undefined;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Tasks"
        description="Create, assign, and track chores and tasks."
        actions={
          <>
            <SearchField
              value={search}
              onChange={(value) => updateFilter(() => setSearch(value))}
              placeholder="Search tasks…"
              label="Search tasks"
            />
            <Button
              className="sm:w-auto"
              disabled={usersQuery.isPending || children.length === 0}
              onClick={() => {
                saveMutation.reset();
                setFormState({ mode: 'create' });
              }}
            >
              Add task
              <Plus aria-hidden="true" />
            </Button>
          </>
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Task summary"
      >
        <StatCard
          label="Total tasks"
          value={stats.total}
          caption="All time"
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          caption="Tasks to be done"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          caption="Tasks done"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Due soon"
          value={stats.dueSoon}
          caption="Within 3 days"
          icon={CalendarDays}
          tone="violet"
        />
      </section>

      {pageError ? <ErrorMessage message={pageError} /> : null}
      {usersQuery.isError ? (
        <ErrorMessage
          title="Unable to load assignees"
          message={getErrorMessage(usersQuery.error)}
        />
      ) : null}
      {!usersQuery.isPending && !usersQuery.isError && children.length === 0 ? (
        <Alert variant="info">
          <UserRound aria-hidden="true" />
          <AlertTitle>Add a Child account before creating tasks.</AlertTitle>
          <AlertDescription>
            Tasks can only be assigned to children.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'COMPLETED'] as const).map((value) => (
            <Button
              key={value}
              variant={status === value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilter(() => setStatus(value))}
            >
              {value === 'ALL'
                ? 'All'
                : value === 'PENDING'
                  ? 'Pending'
                  : 'Completed'}
            </Button>
          ))}
        </div>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Assignee:</span>
          <Select
            value={assigneeId}
            onValueChange={(value) =>
              updateFilter(() => setAssigneeId(value))
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All children</SelectItem>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {tasksQuery.isPending ? (
        <TaskLoadingState />
      ) : tasksQuery.isError ? (
        <ErrorMessage
          title="Unable to load tasks"
          message={getErrorMessage(tasksQuery.error)}
        />
      ) : visibleTasks.length === 0 ? (
        <Card className="grid min-h-52 place-items-center p-8 text-center">
          <div>
            <ClipboardList className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">
              {tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tasks.length === 0
                ? 'Assign the first chore when you are ready.'
                : 'Try changing your search or filters.'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton
                      label="Task"
                      active={sort.startsWith('TITLE')}
                      onClick={() => toggleSort('title')}
                    />
                  </TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>
                    <SortButton
                      label="Due date"
                      active={sort.startsWith('DUE')}
                      onClick={() => toggleSort('due')}
                    />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.items.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <TaskIdentity task={task} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={task.assignedTo.name}
                          seed={task.assignedTo.id}
                          className="size-9"
                        />
                        <span className="font-medium">
                          {task.assignedTo.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TaskDueDate task={task} />
                    </TableCell>
                    <TableCell>
                      <TaskStatusBadge task={task} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ParentTaskMenu
                        task={task}
                        busy={
                          completionMutation.isPending ||
                          deleteMutation.isPending
                        }
                        onCompletion={() =>
                          completionMutation.mutate({
                            id: task.id,
                            completed: !task.completedAt,
                          })
                        }
                        onEdit={() => {
                          saveMutation.reset();
                          setFormState({ mode: 'edit', task });
                        }}
                        onDelete={() => {
                          deleteMutation.reset();
                          setDeleteTarget(task);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="grid gap-4 md:hidden">
            {pagination.items.map((task) => (
              <Card key={task.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <TaskIdentity task={task} />
                  <ParentTaskMenu
                    task={task}
                    busy={
                      completionMutation.isPending || deleteMutation.isPending
                    }
                    onCompletion={() =>
                      completionMutation.mutate({
                        id: task.id,
                        completed: !task.completedAt,
                      })
                    }
                    onEdit={() => {
                      saveMutation.reset();
                      setFormState({ mode: 'edit', task });
                    }}
                    onDelete={() => {
                      deleteMutation.reset();
                      setDeleteTarget(task);
                    }}
                  />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Assigned to
                    </span>
                    <span className="mt-1 block font-medium">
                      {task.assignedTo.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Due date</span>
                    <TaskDueDate task={task} />
                  </div>
                </div>
                <div className="mt-4">
                  <TaskStatusBadge task={task} />
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={setPage}
            itemLabel="tasks"
            firstItem={pagination.firstItem}
            lastItem={pagination.lastItem}
            totalItems={visibleTasks.length}
          />
        </>
      )}

      {formState ? (
        <ResponsiveFormOverlay
          open
          onOpenChange={(open) => {
            if (!open) {
              saveMutation.reset();
              setFormState(null);
            }
          }}
          title={editingTask ? 'Edit task' : 'Create task'}
          description={
            editingTask
              ? 'Update this task’s details.'
              : 'Add a new task and assign it to a child.'
          }
          isBusy={saveMutation.isPending}
          footer={
            <>
              <Button
                variant="outline"
                disabled={saveMutation.isPending}
                onClick={() => setFormState(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={taskFormId}
                disabled={saveMutation.isPending || children.length === 0}
              >
                {saveMutation.isPending
                  ? 'Saving…'
                  : editingTask
                    ? 'Save changes'
                    : 'Create task'}
              </Button>
            </>
          }
        >
          <TaskForm
            key={editingTask?.id ?? 'create'}
            formId={taskFormId}
            task={editingTask}
            children={children}
            isSubmitting={saveMutation.isPending}
            error={
              saveMutation.isError ? getErrorMessage(saveMutation.error) : ''
            }
            onSubmit={handleSave}
          />
        </ResponsiveFormOverlay>
      ) : null}

      <DeleteConfirmation
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete “${deleteTarget?.title ?? 'task'}”?`}
        description="This task and its completion history will be permanently removed. This action cannot be undone."
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-md text-xs font-semibold hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
        active && 'text-primary',
      )}
      onClick={onClick}
    >
      {label}
      <ArrowUpDown aria-hidden="true" />
    </button>
  );
}

function TaskIdentity({ task }: { task: Task }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <ClipboardList aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <strong className="block truncate">{task.title}</strong>
        <span className="mt-1 block line-clamp-1 text-xs text-muted-foreground">
          {task.description || 'No description'}
        </span>
      </span>
    </div>
  );
}

function TaskDueDate({ task }: { task: Task }) {
  return task.dueDate ? (
    <span className="block">
      <span className="block font-medium">{formatDate(task.dueDate)}</span>
      <span className="mt-1 block text-xs text-muted-foreground">
        {formatWeekday(task.dueDate)}
      </span>
    </span>
  ) : (
    <span className="text-muted-foreground">No due date</span>
  );
}

function ParentTaskMenu({
  task,
  busy,
  onCompletion,
  onEdit,
  onDelete,
}: {
  task: Task;
  busy: boolean;
  onCompletion: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Actions for ${task.title}`}
          disabled={busy}
        >
          <MoreVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onCompletion}>
          {task.completedAt ? (
            <RotateCcw aria-hidden="true" />
          ) : (
            <CheckCircle2 aria-hidden="true" />
          )}
          {task.completedAt ? 'Reopen' : 'Mark complete'}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TaskLoadingState() {
  return (
    <Card className="space-y-4 p-5" aria-label="Loading tasks">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </Card>
  );
}
