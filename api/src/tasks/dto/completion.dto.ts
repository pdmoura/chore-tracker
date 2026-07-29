import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CompletionDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  completed!: boolean;
}
