import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { ErrorMessage } from '../components/ErrorMessage';
import { TaskCard } from '../components/tasks/TaskCard';
import { apiRequest, getErrorMessage } from '../lib/api';
import type { Task } from '../types';

export function MyTasksPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

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

  const tasks = tasksQuery.data ?? [];
  const pendingTasks = tasks.filter((task) => !task.completedAt);
  const completedTasks = tasks.filter((task) => task.completedAt);

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">Child dashboard</span>
          <h1>My tasks</h1>
          <p>Keep track of what is pending and what you have finished.</p>
        </div>
      </header>

      {completionMutation.isError ? (
        <ErrorMessage
          title="Unable to update task"
          message={getErrorMessage(completionMutation.error)}
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
          <span>You are all caught up.</span>
        </div>
      ) : (
        <>
          <TaskGroup
            title="Pending"
            tasks={pendingTasks}
            emptyMessage="Nothing pending."
            renderActions={(task) => (
              <button
                className="button button-small button-primary"
                disabled={completionMutation.isPending}
                onClick={() =>
                  completionMutation.mutate({ id: task.id, completed: true })
                }
              >
                Mark complete
              </button>
            )}
          />
          <TaskGroup
            title="Completed"
            tasks={completedTasks}
            emptyMessage="No completed tasks yet."
            renderActions={(task) => (
              <button
                className="button button-small button-quiet"
                disabled={completionMutation.isPending}
                onClick={() =>
                  completionMutation.mutate({ id: task.id, completed: false })
                }
              >
                Mark pending
              </button>
            )}
          />
        </>
      )}
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
