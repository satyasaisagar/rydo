import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  // DB_SYNC env var controls synchronize explicitly
  // Set DB_SYNC=false in Vercel env vars after tables are created
  const dbSync = configService.get('DB_SYNC');
  const synchronize = dbSync !== undefined
    ? dbSync === 'true'
    : true; // DEFAULT: always sync until DB_SYNC=false is set

  const postgresUrl =
    configService.get('POSTGRES_URL') ||
    configService.get('DATABASE_URL');

  const baseConfig = {
    type: 'postgres' as const,
    autoLoadEntities: true,
    synchronize,
    logging: true,
    retryAttempts: 5,
    retryDelay: 3000,
    connectTimeoutMS: 15000,
  };

  if (postgresUrl) {
    return {
      ...baseConfig,
      url: postgresUrl,
      ssl: { rejectUnauthorized: false },
      extra: {
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
      },
    };
  }

  return {
    ...baseConfig,
    host:     configService.get('POSTGRES_HOST') || configService.get('DB_HOST',     'localhost'),
    port:     configService.get<number>('POSTGRES_PORT') || configService.get<number>('DB_PORT', 5432),
    username: configService.get('POSTGRES_USER') || configService.get('DB_USERNAME', 'rydo_user'),
    password: configService.get('POSTGRES_PASSWORD') || configService.get('DB_PASSWORD', 'rydo_password'),
    database: configService.get('POSTGRES_DATABASE') || configService.get('DB_NAME',     'rydo_db'),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
};
