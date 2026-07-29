import { Prisma } from '@prisma/client';
import { safeUserSelect } from '../common/types/safe-user';

export const taskSelect = {
  id: true,
  title: true,
  description: true,
  dueDate: true,
  assignedToId: true,
  createdById: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: { select: safeUserSelect },
  createdBy: { select: safeUserSelect },
} satisfies Prisma.TaskSelect;
