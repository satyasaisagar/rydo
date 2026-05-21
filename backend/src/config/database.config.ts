import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  // DB_SYNC env var controls synchronize:
  //   unset / 'true'  → sync on (creates tables — default for initial deploy)
  //   'false'         → sync off (safe for production after tables exist)
  const dbSync = configService.get<string>('DB_SYNC');
  const synchronize = dbSync === 'false' ? false : true;

  const postgresUrl =
    configService.get<string>('POSTGRES_URL') ||
    configService.get<string>('DATABASE_URL');

  const base = {
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
      ...base,
      url: postgresUrl,
      ssl: { rejectUnauthorized: false },
      extra: {
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
      },
    };
  }

  // Local Docker / individual host vars
  const host     = configService.get<string>('POSTGRES_HOST')     || configService.get<string>('DB_HOST')     || 'localhost';
  const port      = Number(configService.get<string>('POSTGRES_PORT') || configService.get<string>('DB_PORT') || '5432');
  const username  = configService.get<string>('POSTGRES_USER')     || configService.get<string>('DB_USERNAME') || 'rydo_user';
  const password  = configService.get<string>('POSTGRES_PASSWORD') || configService.get<string>('DB_PASSWORD') || 'rydo_password';
  const database  = configService.get<string>('POSTGRES_DATABASE') || configService.get<string>('DB_NAME')    || 'rydo_db';
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  return {
    ...base,
    host,
    port,
    username,
    password,
    database,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
};
