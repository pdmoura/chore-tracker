import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Tidy your room' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/\S/, { message: 'title must contain a non-whitespace character' })
  title!: string;

  @ApiPropertyOptional({ example: 'Put away clothes and toys.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({
    example: '2026-08-01T18:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  dueDate?: string | null;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Required for Parent requests. Child requests must omit this field.',
  })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
