import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { SafeUser } from '../common/types/safe-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { taskSelect } from './task-select';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(user: SafeUser) {
    return this.prisma.task.findMany({
      where: user.role === Role.CHILD ? { assignedToId: user.id } : undefined,
      select: taskSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, user: SafeUser) {
    const task = await this.findVisibleTask(id, user);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(dto: CreateTaskDto, user: SafeUser) {
    const assignedToId = await this.resolveCreateAssignee(dto, user);

    return this.prisma.task.create({
      data: {
        title: dto.title.trim(),
        description: this.normalizeDescription(dto.description),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assignedToId,
        createdById: user.id,
      },
      select: taskSelect,
    });
  }

  async update(id: string, dto: UpdateTaskDto, user: SafeUser) {
    if (
      dto.title === undefined &&
      dto.description === undefined &&
      dto.dueDate === undefined &&
      dto.assignedToId === undefined
    ) {
      throw new BadRequestException('At least one field must be provided');
    }

    const task = await this.findVisibleTask(id, user);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    this.assertCanManageTask(task, user);

    if (user.role === Role.CHILD && dto.assignedToId !== undefined) {
      throw new ForbiddenException('Children cannot assign tasks');
    }
    if (dto.assignedToId !== undefined) {
      await this.assertChildAssignee(dto.assignedToId);
    }

    const data: Prisma.TaskUpdateInput = {};
    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      data.description = this.normalizeDescription(dto.description);
    }
    if (dto.dueDate !== undefined) {
      data.dueDate = dto.dueDate === null ? null : new Date(dto.dueDate);
    }
    if (dto.assignedToId !== undefined) {
      data.assignedTo = { connect: { id: dto.assignedToId } };
    }

    return this.prisma.task.update({
      where: { id },
      data,
      select: taskSelect,
    });
  }

  async delete(id: string, user: SafeUser): Promise<void> {
    const task = await this.findVisibleTask(id, user);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    this.assertCanManageTask(task, user);

    await this.prisma.task.delete({ where: { id } });
  }

  async updateCompletion(id: string, completed: boolean, user: SafeUser) {
    const task = await this.findVisibleTask(id, user);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data: { completedAt: completed ? new Date() : null },
      select: taskSelect,
    });
  }

  private findVisibleTask(id: string, user: SafeUser) {
    return this.prisma.task.findFirst({
      where: {
        id,
        ...(user.role === Role.CHILD ? { assignedToId: user.id } : {}),
      },
      select: taskSelect,
    });
  }

  private assertCanManageTask(
    task: { assignedToId: string; createdById: string },
    user: SafeUser,
  ): void {
    if (
      user.role === Role.CHILD &&
      (task.assignedToId !== user.id || task.createdById !== user.id)
    ) {
      throw new ForbiddenException(
        'Children can only manage tasks they created for themselves',
      );
    }
  }

  private async resolveCreateAssignee(
    dto: CreateTaskDto,
    user: SafeUser,
  ): Promise<string> {
    if (user.role === Role.CHILD) {
      if (dto.assignedToId !== undefined) {
        throw new ForbiddenException('Children cannot assign tasks');
      }

      return user.id;
    }

    if (!dto.assignedToId) {
      throw new BadRequestException(
        'assignedToId is required for parent-created tasks',
      );
    }

    await this.assertChildAssignee(dto.assignedToId);
    return dto.assignedToId;
  }

  private async assertChildAssignee(userId: string): Promise<void> {
    const assignee = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!assignee || assignee.role !== Role.CHILD) {
      throw new BadRequestException('Tasks can only be assigned to a child');
    }
  }

  private normalizeDescription(description?: string | null): string | null {
    const normalized = description?.trim();
    return normalized ? normalized : null;
  }
}
