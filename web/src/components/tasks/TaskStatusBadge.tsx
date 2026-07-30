import { CheckCircle2, Clock3 } from 'lucide-react';
import type { Task } from '@/types';
import { Badge } from '../ui/badge';

export function TaskStatusBadge({ task }: { task: Task }) {
  return task.completedAt ? (
    <Badge variant="success">
      <CheckCircle2 aria-hidden="true" />
      Completed
    </Badge>
  ) : (
    <Badge variant="warning">
      <Clock3 aria-hidden="true" />
      Pending
    </Badge>
  );
}
