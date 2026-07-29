import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { ErrorMessage } from '../components/ErrorMessage';
import { TaskCard } from '../components/tasks/TaskCard';
import {
  TaskForm,
  type TaskFormValues,
} from '../components/tasks/TaskForm';
import { apiRequest, getErrorMessage } from '../lib/api';
import type { Task } from '../types';

type FormState = { mode: 'create' } | { mode: 'edit'; task: Task } | null;

export function MyTasksPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<FormState>(null);

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
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  async function handleSave(values: TaskFormValues) {
    saveMutation.reset();
    await saveMutation.mutateAsync({
      values,
      editing: formState?.mode === 'edit' ? formState.task : undefined,
    });
  }

  function handleDelete(task: Task) {
    deleteMutation.reset();
    if (window.confirm(`Delete “${task.title}”? This cannot be undone.`)) {
      deleteMutation.mutate(task.id);
    }
  }

  const tasks = tasksQuery.data ?? [];
  const pendingTasks = tasks.filter((task) => !task.completedAt);
  const completedTasks = tasks.filter((task) => task.completedAt);
  const pageError = deleteMutation.isError
    ? getErrorMessage(deleteMutation.error)
    : completionMutation.isError
      ? getErrorMessage(completionMutation.error)
      : '';

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">Child dashboard</span>
          <h1>My tasks</h1>
          <p>Create your own tasks and keep track of what you have finished.</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => {
            saveMutation.reset();
            setFormState({ mode: 'create' });
          }}
        >
          Add task
        </button>
      </header>

      {pageError ? (
        <ErrorMessage title="Unable to update task" message={pageError} />
      ) : null}

      {formState ? (
        <TaskForm
          key={formState.mode === 'edit' ? formState.task.id : 'create'}
          task={formState.mode === 'edit' ? formState.task : undefined}
          selfAssigned
          isSubmitting={saveMutation.isPending}
          error={
            saveMutation.isError ? getErrorMessage(saveMutation.error) : ''
          }
          onSubmit={handleSave}
          onCancel={() => {
            saveMutation.reset();
            setFormState(null);
          }}
        />
      ) : null}

      {tasksQuery.isPending ? (
        <div className="content-panel inline-status">Loading your tasks…</div>
      ) : tasksQuery.isError ? (
        <ErrorMessage
          title="Unable to load tasks"
          message={getErrorMessage(tasksQuery.error)}
        />
      ) : tasks.length === 0 ? (
        <div className="content-panel empty-state">
          <strong>No assigned tasks</strong>
          <span>Create one whenever you need a reminder.</span>
        </div>
      ) : (
        <>
          <TaskGroup
            title="Pending"
            tasks={pendingTasks}
            emptyMessage="Nothing pending."
            renderActions={(task) => (
              <ChildTaskActions
                task={task}
                userId={user?.id}
                completionPending={completionMutation.isPending}
                deletePending={deleteMutation.isPending}
                onCompletion={(completed) =>
                  completionMutation.mutate({ id: task.id, completed })
                }
                onEdit={() => {
                  saveMutation.reset();
                  setFormState({ mode: 'edit', task });
                }}
                onDelete={() => handleDelete(task)}
              />
            )}
          />
          <TaskGroup
            title="Completed"
            tasks={completedTasks}
            emptyMessage="No completed tasks yet."
            renderActions={(task) => (
              <ChildTaskActions
                task={task}
                userId={user?.id}
                completionPending={completionMutation.isPending}
                deletePending={deleteMutation.isPending}
                onCompletion={(completed) =>
                  completionMutation.mutate({ id: task.id, completed })
                }
                onEdit={() => {
                  saveMutation.reset();
                  setFormState({ mode: 'edit', task });
                }}
                onDelete={() => handleDelete(task)}
              />
            )}
          />
        </>
      )}
    </div>
  );
}

function ChildTaskActions({
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
  onCompletion: (completed: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const canManage =
    task.createdById === userId && task.assignedToId === userId;

  return (
    <div className="task-actions">
      <button
        className={`button button-small ${
          task.completedAt ? 'button-quiet' : 'button-primary'
        }`}
        disabled={completionPending}
        onClick={() => onCompletion(!task.completedAt)}
      >
        {task.completedAt ? 'Mark pending' : 'Mark complete'}
      </button>
      {canManage ? (
        <>
          <button
            className="button button-small button-quiet"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="button button-small button-danger"
            disabled={deletePending}
            onClick={onDelete}
          >
            Delete
          </button>
        </>
      ) : null}
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  emptyMessage,
  renderActions,
}: {
  title: string;
  tasks: Task[];
  emptyMessage: string;
  renderActions: (task: Task) => React.ReactNode;
}) {
  return (
    <section className="content-panel" aria-labelledby={`${title}-tasks-title`}>
      <div className="section-heading">
        <h2 id={`${title}-tasks-title`}>{title}</h2>
        <span className="count-pill">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <div className="compact-empty">{emptyMessage}</div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              actions={renderActions(task)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
