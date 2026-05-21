import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Vercel Postgres (Neon) — POSTGRES_URL injected automatically by Vercel
  const postgresUrl =
    configService.get('POSTGRES_URL') ||
    configService.get('DATABASE_URL');

  const baseConfig = {
    type: 'postgres' as const,
    autoLoadEntities: true,
    // In production, never auto-sync — use migrations
    synchronize: !isProduction,
    logging: !isProduction,
    // Retry on connection failure — important for serverless cold starts
    retryAttempts: 3,
    retryDelay: 3000,
    // Don't crash the app if DB is unreachable at startup
    connectTimeoutMS: 10000,
  };

  if (postgresUrl) {
    return {
      ...baseConfig,
      url: postgresUrl,
      ssl: { rejectUnauthorized: false },
      extra: {
        // Neon serverless pool settings
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      },
    };
  }

  // Individual host vars — for local Docker or explicit Neon creds
  const host = configService.get('POSTGRES_HOST') || configService.get('DB_HOST', 'localhost');
  const port = configService.get<number>('POSTGRES_PORT') || configService.get<number>('DB_PORT', 5432);
  const username = configService.get('POSTGRES_USER') || configService.get('DB_USERNAME', 'rydo_user');
  const password = configService.get('POSTGRES_PASSWORD') || configService.get('DB_PASSWORD', 'rydo_password');
  const database = configService.get('POSTGRES_DATABASE') || configService.get('DB_NAME', 'rydo_db');

  return {
    ...baseConfig,
    host,
    port,
    username,
    password,
    database,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
};
