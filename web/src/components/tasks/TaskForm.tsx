import { useState, type FormEvent } from 'react';
import { toDateTimeInput } from '../../lib/format';
import type { Task, User } from '../../types';
import { ErrorMessage } from '../ErrorMessage';

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  assignedToId?: string;
}

export function TaskForm({
  task,
  children = [],
  selfAssigned = false,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: {
  task?: Task;
  children?: User[];
  selfAssigned?: boolean;
  isSubmitting: boolean;
  error: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? toDateTimeInput(task.dueDate) : '',
  );
  const [assignedToId, setAssignedToId] = useState(
    task?.assignedToId ?? children[0]?.id ?? '',
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await onSubmit({
        title,
        description,
        dueDate,
        ...(selfAssigned ? {} : { assignedToId }),
      });
    } catch {
      return;
    }
  }

  return (
    <section className="form-panel" aria-labelledby="task-form-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{task ? 'Edit task' : 'New task'}</span>
          <h2 id="task-form-title">
            {task
              ? task.title
              : selfAssigned
                ? 'Create a task'
                : 'Assign a task'}
          </h2>
        </div>
        <button className="button button-quiet" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      <form onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
          />
        </label>
        <label>
          Description (optional)
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
          />
        </label>
        <div className={selfAssigned ? undefined : 'form-grid'}>
          {!selfAssigned ? (
            <label>
              Assigned child
              <select
                value={assignedToId}
                onChange={(event) => setAssignedToId(event.target.value)}
                required
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            Due date (optional)
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
        </div>
        <button
          className="button button-primary"
          disabled={isSubmitting || (!selfAssigned && children.length === 0)}
        >
          {isSubmitting ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </button>
      </form>
    </section>
  );
}
