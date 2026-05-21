import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';

const server = express();
let isBootstrapped = false;
let app: any;

async function bootstrap() {
  if (isBootstrapped) return;

  app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    {
      logger: ['error', 'warn', 'log'],
      abortOnError: false, // Don't crash on DB connection errors
    },
  );

  // Security
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS — allow Vercel domains + localhost
  app.enableCors({
    origin: (origin: string, cb: Function) => {
      const allowed = !origin ||
        /\.vercel\.app$/.test(origin) ||
        /localhost:\d+/.test(origin) ||
        origin === (process.env.FRONTEND_URL || '');
      cb(null, allowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rydo API')
    .setDescription('Rydo Ride Sharing Platform — REST API')
    .setVersion('2.0')
    .addServer('https://rydo-backend-mocha.vercel.app', 'Production')
    .addServer('http://localhost:4000', 'Local Development')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT-auth',
    )
    .addTag('Auth').addTag('Users').addTag('Rides')
    .addTag('Bookings').addTag('Chats').addTag('Ratings')
    .addTag('Notifications').addTag('Admin')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true, docExpansion: 'none' },
  });

  await app.init();
  isBootstrapped = true;
}

// Vercel serverless handler
export default async (req: any, res: any) => {
  try {
    await bootstrap();
    server(req, res);
  } catch (err) {
    console.error('Bootstrap error:', err?.message || err);
    res.status(500).json({
      statusCode: 500,
      message: 'Server initialization failed',
      error: process.env.NODE_ENV !== 'production' ? err?.message : 'Internal Server Error',
    });
  }
};
