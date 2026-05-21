import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Root — API status' })
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
  async health() {
    let db = 'unknown';
    try {
      await this.dataSource.query('SELECT 1');
      db = 'connected';
    } catch (e: any) {
      db = `error: ${e?.message}`;
    }
    return {
      status: 'ok',
      db,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('admin/sync-schema')
  @ApiOperation({ summary: 'Force TypeORM synchronize — run once to create tables' })
  async syncSchema() {
    try {
      await this.dataSource.synchronize();
      return {
        status: 'ok',
        message: 'Schema synchronized — all tables created/updated',
        timestamp: new Date().toISOString(),
      };
    } catch (e: any) {
      return {
        status: 'error',
        message: e?.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
