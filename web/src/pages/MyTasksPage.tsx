import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PageHeader } from '@/components/PageHeader';
import { ResponsiveFormOverlay } from '@/components/ResponsiveFormOverlay';
import { StatCard } from '@/components/StatCard';
import {
  TaskForm,
  type TaskFormValues,
} from '@/components/tasks/TaskForm';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest, getErrorMessage } from '@/lib/api';
import { formatDate, formatWeekday } from '@/lib/format';
import {
  canChildManageTask,
  getTaskStats,
  isDueToday,
} from '@/lib/task-view';
import type { Task } from '@/types';

type FormState = { mode: 'create' } | { mode: 'edit'; task: Task } | null;
const taskFormId = 'child-task-form';

export function MyTasksPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiRequest<Task[]>('/tasks', { token }),
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

  const tasks = tasksQuery.data ?? [];
  const pendingTasks = tasks.filter((task) => !task.completedAt);
  const completedTasks = tasks.filter((task) => task.completedAt);
  const stats = getTaskStats(tasks);
  const pageError = deleteMutation.isError
    ? getErrorMessage(deleteMutation.error)
    : completionMutation.isError
      ? getErrorMessage(completionMutation.error)
      : '';
  const editingTask =
    formState?.mode === 'edit' ? formState.task : undefined;

  async function handleSave(values: TaskFormValues) {
    saveMutation.reset();
    await saveMutation.mutateAsync({
      values,
      editing: editingTask,
    });
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="My tasks"
        description="Keep going! You’re doing a great job."
        actions={
          <Button
            onClick={() => {
              saveMutation.reset();
              setFormState({ mode: 'create' });
            }}
          >
            Add task
            <Plus aria-hidden="true" />
          </Button>
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="My task summary"
      >
        <StatCard
          label="Pending"
          value={stats.pending}
          caption="Tasks to do"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          caption="Nice work!"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Due today"
          value={stats.dueToday}
          caption="Keep it up!"
          icon={CalendarDays}
          tone="violet"
        />
      </section>

      {pageError ? (
        <ErrorMessage title="Unable to update task" message={pageError} />
      ) : null}

      {tasksQuery.isPending ? (
        <Card className="space-y-4 p-5" aria-label="Loading your tasks">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </Card>
      ) : tasksQuery.isError ? (
        <ErrorMessage
          title="Unable to load tasks"
          message={getErrorMessage(tasksQuery.error)}
        />
      ) : tasks.length === 0 ? (
        <Card className="grid min-h-56 place-items-center p-8 text-center">
          <div>
            <ClipboardList className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">No assigned tasks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create one whenever you need a reminder.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <TaskGroup
            title="Pending"
            tasks={pendingTasks}
            emptyMessage="Nothing pending."
            userId={user?.id}
            completionPending={completionMutation.isPending}
            deletePending={deleteMutation.isPending}
            onCompletion={(task) =>
              completionMutation.mutate({ id: task.id, completed: true })
            }
            onEdit={(task) => {
              saveMutation.reset();
              setFormState({ mode: 'edit', task });
            }}
            onDelete={(task) => {
              deleteMutation.reset();
              setDeleteTarget(task);
            }}
          />
          <TaskGroup
            title="Completed"
            tasks={completedTasks}
            emptyMessage="No completed tasks yet."
            userId={user?.id}
            completionPending={completionMutation.isPending}
            deletePending={deleteMutation.isPending}
            onCompletion={(task) =>
              completionMutation.mutate({ id: task.id, completed: false })
            }
            onEdit={(task) => {
              saveMutation.reset();
              setFormState({ mode: 'edit', task });
            }}
            onDelete={(task) => {
              deleteMutation.reset();
              setDeleteTarget(task);
            }}
          />
          <Card className="relative overflow-hidden border-primary/10 bg-primary/5 p-5">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Sparkles aria-hidden="true" />
              </span>
              <div>
                <strong>You’re doing awesome!</strong>
                <p className="mt-1 text-sm text-muted-foreground">
                  Every task you complete helps our home run smoothly.
                </p>
              </div>
              <Star className="ml-auto hidden size-14 fill-amber-300 text-amber-400 sm:block" />
            </div>
          </Card>
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
              ? 'Update your task’s details.'
              : 'Create a personal task for yourself.'
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
                disabled={saveMutation.isPending}
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
            selfAssigned
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
        description="This personal task will be permanently removed. This action cannot be undone."
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  emptyMessage,
  userId,
  completionPending,
  deletePending,
  onCompletion,
  onEdit,
  onDelete,
}: {
  title: string;
  tasks: Task[];
  emptyMessage: string;
  userId?: string;
  completionPending: boolean;
  deletePending: boolean;
  onCompletion: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <section aria-labelledby={`${title.toLowerCase()}-tasks-title`}>
      <h2
        id={`${title.toLowerCase()}-tasks-title`}
        className="mb-3 text-lg font-bold"
      >
        {title}{' '}
        <span className="font-normal text-muted-foreground">
          ({tasks.length})
        </span>
      </h2>
      {tasks.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {tasks.map((task) => (
            <ChildTaskRow
              key={task.id}
              task={task}
              userId={userId}
              completionPending={completionPending}
              deletePending={deletePending}
              onCompletion={() => onCompletion(task)}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
            />
          ))}
        </Card>
      )}
    </section>
  );
}

function ChildTaskRow({
  task,
  userId,
  completionPending,
  deletePending,
  onCompletion,
  onEdit,
  onDelete,
}: {
  task: Task;
  userId?: string;
  completionPending: boolean;
  deletePending: boolean;
  onCompletion: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const canManage = canChildManageTask(task, userId);

  return (
    <article className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_11rem_auto_auto] lg:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <ClipboardList aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{task.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {task.description || 'No description'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <CalendarDays
          className={isDueToday(task) ? 'text-primary' : 'text-muted-foreground'}
          aria-hidden="true"
        />
        {isDueToday(task) ? (
          <strong className="text-primary">Today</strong>
        ) : task.dueDate ? (
          <span>
            <span className="block">{formatDate(task.dueDate)}</span>
            <span className="text-xs text-muted-foreground">
              {formatWeekday(task.dueDate)}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">No due date</span>
        )}
      </div>

      <TaskStatusBadge task={task} />

      <div className="flex items-center gap-2 lg:justify-end">
        <Button
          variant={task.completedAt ? 'outline' : 'default'}
          className="flex-1 lg:min-w-36"
          disabled={completionPending}
          onClick={onCompletion}
        >
          {task.completedAt ? (
            <RotateCcw aria-hidden="true" />
          ) : (
            <CheckCircle2 aria-hidden="true" />
          )}
          {task.completedAt ? 'Reopen' : 'Mark complete'}
        </Button>
        {canManage ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Manage ${task.title}`}
                disabled={deletePending}
              >
                <MoreVertical aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
        ) : null}
      </div>
    </article>
  );
}
