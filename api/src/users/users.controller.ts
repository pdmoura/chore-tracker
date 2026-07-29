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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { SafeUser } from '../common/types/safe-user';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Roles(Role.PARENT)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ description: 'All users without password hashes.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiCreatedResponse({ description: 'User created.' })
  @ApiConflictResponse({ description: 'Email already exists.' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'User found.' })
  @ApiNotFoundResponse({ description: 'User does not exist.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'User updated.' })
  @ApiConflictResponse({ description: 'Email already exists.' })
  @ApiNotFoundResponse({ description: 'User does not exist.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'User deleted.' })
  @ApiConflictResponse({
    description: 'Self-deletion or related tasks prevent deletion.',
  })
  @ApiNotFoundResponse({ description: 'User does not exist.' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: SafeUser,
  ): Promise<void> {
    await this.usersService.delete(id, currentUser.id);
  }
}
