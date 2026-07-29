import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('operational')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  getHealth() {
    return { status: 'ok' };
  }
}
