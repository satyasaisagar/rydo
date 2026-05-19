import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

const config = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host:     config.get('DB_HOST',     'localhost'),
  port:     config.get<number>('DB_PORT', 5432),
  username: config.get('DB_USERNAME', 'rydo_user'),
  password: config.get('DB_PASSWORD', 'rydo_password'),
  database: config.get('DB_NAME',     'rydo_db'),
  entities:   ['src/**/*.entity.ts'],
  migrations: ['database/migrations/*.ts'],
  synchronize: false,
  logging: config.get('NODE_ENV') === 'development',
});
