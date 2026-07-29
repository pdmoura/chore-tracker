import type { ReactNode } from 'react';
import type { Task } from '../../types';
import { formatDate } from '../../lib/format';

export function TaskCard({
  task,
  showAssignee = false,
  actions,
}: {
  task: Task;
  showAssignee?: boolean;
  actions: ReactNode;
}) {
  const completed = Boolean(task.completedAt);

  return (
    <article className={`task-card ${completed ? 'task-card-completed' : ''}`}>
      <div className="task-card-heading">
        <div>
          <span className={`status-pill ${completed ? 'is-complete' : ''}`}>
            {completed ? 'Completed' : 'Pending'}
          </span>
          <h3>{task.title}</h3>
        </div>
        {actions}
      </div>

      {task.description ? <p>{task.description}</p> : null}

      <dl className="task-meta">
        {showAssignee ? (
          <div>
            <dt>Assigned to</dt>
            <dd>{task.assignedTo.name}</dd>
          </div>
        ) : null}
        <div>
          <dt>Due</dt>
          <dd>{task.dueDate ? formatDate(task.dueDate) : 'No due date'}</dd>
        </div>
        {completed && task.completedAt ? (
          <div>
            <dt>Completed</dt>
            <dd>{formatDate(task.completedAt)}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
