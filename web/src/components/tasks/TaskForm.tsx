import { useState, type FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import { toDateTimeInput } from '@/lib/format';
import type { Task, User } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  assignedToId?: string;
}

export function TaskForm({
  formId,
  task,
  children = [],
  selfAssigned = false,
  isSubmitting,
  error,
  onSubmit,
}: {
  formId: string;
  task?: Task;
  children?: User[];
  selfAssigned?: boolean;
  isSubmitting: boolean;
  error: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
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
    <form
      id={formId}
      className="grid gap-5"
      onSubmit={(event) => void handleSubmit(event)}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Unable to save task</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-title`}>
          Task title <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${formId}-title`}
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g., Take out the trash"
          maxLength={200}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${formId}-description`}>
            Description <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <span className="text-xs text-muted-foreground">
            {description.length}/2000
          </span>
        </div>
        <Textarea
          id={`${formId}-description`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add helpful details or instructions…"
          maxLength={2000}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-due-date`}>
          Due date <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id={`${formId}-due-date`}
          type="datetime-local"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty if this task has no due date.
        </p>
      </div>

      {!selfAssigned ? (
        <div className="grid gap-2">
          <Label>
            Assign to child <span className="text-destructive">*</span>
          </Label>
          <Select
            value={assignedToId}
            onValueChange={setAssignedToId}
            disabled={isSubmitting || children.length === 0}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Tasks can only be assigned to Child accounts.
          </p>
        </div>
      ) : null}
    </form>
  );
}
