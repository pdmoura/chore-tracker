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
import type { Task, User } from '../types';

type FormState = { mode: 'create' } | { mode: 'edit'; task: Task } | null;

export function TasksPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<FormState>(null);

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
        assignedToId: values.assignedToId,
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
  const children = (usersQuery.data ?? []).filter(
    (user) => user.role === 'CHILD',
  );
  const pageError = deleteMutation.isError
    ? getErrorMessage(deleteMutation.error)
    : completionMutation.isError
      ? getErrorMessage(completionMutation.error)
      : '';

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">Parent dashboard</span>
          <h1>Family tasks</h1>
          <p>Assign chores, set due dates, and keep completion visible.</p>
        </div>
        <button
          className="button button-primary"
          disabled={usersQuery.isPending || children.length === 0}
          onClick={() => {
            saveMutation.reset();
            setFormState({ mode: 'create' });
          }}
        >
          Add task
        </button>
      </header>

      {pageError ? <ErrorMessage message={pageError} /> : null}
      {usersQuery.isError ? (
        <ErrorMessage
          title="Unable to load assignees"
          message={getErrorMessage(usersQuery.error)}
        />
      ) : null}
      {!usersQuery.isPending && !usersQuery.isError && children.length === 0 ? (
        <div className="alert alert-info" role="status">
          <strong>Add a Child account before creating tasks.</strong>
          <span>Tasks can only be assigned to children.</span>
        </div>
      ) : null}

      {formState ? (
        <TaskForm
          key={formState.mode === 'edit' ? formState.task.id : 'create'}
          task={formState.mode === 'edit' ? formState.task : undefined}
          children={children}
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

      <section className="content-panel" aria-labelledby="all-tasks-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Overview</span>
            <h2 id="all-tasks-title">All tasks</h2>
          </div>
          <span className="count-pill">{tasks.length}</span>
        </div>

        {tasksQuery.isPending ? (
          <div className="inline-status">Loading family tasks…</div>
        ) : tasksQuery.isError ? (
          <ErrorMessage
            title="Unable to load tasks"
            message={getErrorMessage(tasksQuery.error)}
          />
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <strong>No tasks yet</strong>
            <span>Assign the first chore when you are ready.</span>
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                showAssignee
                actions={
                  <div className="task-actions">
                    <button
                      className="button button-small button-quiet"
                      disabled={completionMutation.isPending}
                      onClick={() =>
                        completionMutation.mutate({
                          id: task.id,
                          completed: !task.completedAt,
                        })
                      }
                    >
                      {task.completedAt ? 'Reopen' : 'Complete'}
                    </button>
                    <button
                      className="button button-small button-quiet"
                      onClick={() => {
                        saveMutation.reset();
                        setFormState({ mode: 'edit', task });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="button button-small button-danger"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(task)}
                    >
                      Delete
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
