import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { SafeUser } from '../common/types/safe-user';
import { CompletionDto } from './dto/completion.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOkResponse({ description: 'Visible tasks.' })
  findAll(@CurrentUser() user: SafeUser) {
    return this.tasksService.findAll(user);
  }

  @Post()
  @Roles(Role.PARENT, Role.CHILD)
  @ApiCreatedResponse({ description: 'Task created.' })
  @ApiForbiddenResponse({
    description: 'A child attempted to specify an assignee.',
  })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: SafeUser) {
    return this.tasksService.create(dto, user);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Visible task.' })
  @ApiNotFoundResponse({
    description: 'Task does not exist or is not visible.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: SafeUser,
  ) {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.PARENT, Role.CHILD)
  @ApiOkResponse({ description: 'Task updated.' })
  @ApiForbiddenResponse({
    description: 'A child does not own the assigned task.',
  })
  @ApiNotFoundResponse({
    description: 'Task does not exist or is not visible.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.tasksService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.PARENT, Role.CHILD)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Task deleted.' })
  @ApiForbiddenResponse({
    description: 'A child does not own the assigned task.',
  })
  @ApiNotFoundResponse({
    description: 'Task does not exist or is not visible.',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: SafeUser,
  ): Promise<void> {
    await this.tasksService.delete(id, user);
  }

  @Patch(':id/completion')
  @ApiOkResponse({ description: 'Task completion updated.' })
  @ApiNotFoundResponse({
    description: 'Task does not exist or is not visible.',
  })
  updateCompletion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompletionDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.tasksService.updateCompletion(id, dto.completed, user);
  }
}
