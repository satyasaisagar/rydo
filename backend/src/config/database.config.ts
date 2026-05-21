import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Vercel Postgres (Neon) Database Configuration
 *
 * Vercel Postgres automatically injects these env vars when you connect
 * a Postgres database to your project:
 *   POSTGRES_URL              — pooled connection (use for app queries)
 *   POSTGRES_URL_NON_POOLING  — direct connection (use for migrations)
 *   POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE
 *
 * The DATABASE_URL env var is a fallback for local Docker development.
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Vercel Postgres (Neon) — pooled URL takes priority
  const postgresUrl =
    configService.get('POSTGRES_URL') ||
    configService.get('DATABASE_URL') ||
    buildLocalConnectionString(configService);

  if (postgresUrl) {
    return {
      type: 'postgres',
      url: postgresUrl,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: !isProduction,
      logging: !isProduction,
      extra: isProduction
        ? {
            // Neon serverless connection pool settings
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
          }
        : {},
    };
  }

  // Explicit host/port fallback (local development)
  return {
    type: 'postgres',
    host:     configService.get('DB_HOST',     'localhost'),
    port:     configService.get<number>('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'rydo_user'),
    password: configService.get('DB_PASSWORD', 'rydo_password'),
    database: configService.get('DB_NAME',     'rydo_db'),
    ssl: false,
    autoLoadEntities: true,
    synchronize: true,
    logging: true,
  };
};

function buildLocalConnectionString(configService: ConfigService): string | null {
  const host = configService.get('POSTGRES_HOST');
  const user = configService.get('POSTGRES_USER');
  const pass = configService.get('POSTGRES_PASSWORD');
  const db   = configService.get('POSTGRES_DATABASE');
  if (host && user && pass && db) {
    return `postgres://${user}:${pass}@${host}/${db}?sslmode=require`;
  }
  return null;
}

/** For TypeORM CLI migrations — uses non-pooling direct connection */
export const getMigrationDataSourceConfig = (
  configService: ConfigService,
) => ({
  type: 'postgres' as const,
  url:
    configService.get('POSTGRES_URL_NON_POOLING') ||
    configService.get('POSTGRES_URL') ||
    configService.get('DATABASE_URL') ||
    `postgres://${configService.get('DB_USERNAME', 'rydo_user')}:${configService.get('DB_PASSWORD', 'rydo_password')}@${configService.get('DB_HOST', 'localhost')}:${configService.get('DB_PORT', 5432)}/${configService.get('DB_NAME', 'rydo_db')}`,
  ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  entities:   ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
});
