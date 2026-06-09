import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Public()
@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
    };
  }
}
