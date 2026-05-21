import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * TypeORM CLI DataSource
 * Used for: npm run migration:generate / migration:run / migration:revert
 *
 * Uses POSTGRES_URL_NON_POOLING (direct Neon connection — required for migrations)
 * Falls back to POSTGRES_URL or local DB_* vars.
 */
const postgresUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL            ||
  process.env.DATABASE_URL;

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource(
  postgresUrl
    ? {
        type: 'postgres',
        url: postgresUrl,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
        entities:   ['src/**/*.entity.ts'],
        migrations: ['database/migrations/*.ts'],
        synchronize: false,
        logging: true,
      }
    : {
        type: 'postgres',
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'rydo_user',
        password: process.env.DB_PASSWORD || 'rydo_password',
        database: process.env.DB_NAME     || 'rydo_db',
        ssl: false,
        entities:   ['src/**/*.entity.ts'],
        migrations: ['database/migrations/*.ts'],
        synchronize: false,
        logging: true,
      },
);

export default AppDataSource;
