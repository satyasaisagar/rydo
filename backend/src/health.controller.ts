import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Root health check' })
  root() {
    return {
      status: 'ok',
      service: 'rydo-api',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      docs: '/api/docs',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
