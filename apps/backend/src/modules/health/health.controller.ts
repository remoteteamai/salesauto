import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators';

@Controller()
export class HealthController {
  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'melioro-api',
      version: '1.0.0'
    };
  }
}
