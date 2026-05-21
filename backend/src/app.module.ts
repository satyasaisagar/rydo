import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { getDatabaseConfig } from './config/database.config';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RidesModule } from './rides/rides.module';
import { BookingsModule } from './bookings/bookings.module';
import { ChatsModule } from './chats/chats.module';
import { RatingsModule } from './ratings/ratings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // Vercel Postgres (Neon) — auto-detects POSTGRES_URL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    AuthModule,
    UsersModule,
    RidesModule,
    BookingsModule,
    ChatsModule,
    RatingsModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
