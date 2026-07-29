import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { safeUserSelect } from '../common/types/safe-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: safeUserSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email: dto.email.trim().toLowerCase(),
          passwordHash: await bcrypt.hash(dto.password, 12),
          role: dto.role,
        },
        select: safeUserSelect,
      });
    } catch (error: unknown) {
      this.throwKnownWriteError(error);
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    if (
      dto.name === undefined &&
      dto.email === undefined &&
      dto.password === undefined
    ) {
      throw new BadRequestException('At least one field must be provided');
    }

    await this.findOne(id);
    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.email !== undefined) {
      data.email = dto.email.trim().toLowerCase();
    }
    if (dto.password !== undefined) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: safeUserSelect,
      });
    } catch (error: unknown) {
      this.throwKnownWriteError(error);
    }
  }

  async delete(id: string, currentUserId: string): Promise<void> {
    if (id === currentUserId) {
      throw new ConflictException('A parent cannot delete their own account');
    }

    await this.findOne(id);
    const relatedTaskCount = await this.prisma.task.count({
      where: {
        OR: [{ assignedToId: id }, { createdById: id }],
      },
    });

    if (relatedTaskCount > 0) {
      throw new ConflictException(
        'Delete or reassign related tasks before deleting this user',
      );
    }

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Delete or reassign related tasks before deleting this user',
        );
      }
      throw error;
    }
  }

  private throwKnownWriteError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('A user with this email already exists');
    }
    throw error;
  }
}
