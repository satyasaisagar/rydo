import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import type { Request, Response } from 'express';

// Cached app instance for warm serverless invocations
let app: any;
let bootstrapPromise: Promise<any> | null = null;

async function bootstrap() {
  if (app) return app;
  // Prevent multiple concurrent bootstraps on cold start
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const instance = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
      abortOnError: false,
    });

    // Security
    instance.use(helmet({ contentSecurityPolicy: false }));

    // CORS
    instance.enableCors({
      origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
        const allowed =
          !origin ||
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
    instance.setGlobalPrefix('api');

    // Validation
    instance.useGlobalPipes(
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

    const document = SwaggerModule.createDocument(instance, swaggerConfig);
    SwaggerModule.setup('api/docs', instance, document, {
      swaggerOptions: { persistAuthorization: true, docExpansion: 'none' },
    });

    await instance.init();
    app = instance;
    return app;
  })();

  return bootstrapPromise;
}

// Vercel serverless handler — called on every request
export default async (req: Request, res: Response) => {
  try {
    const instance = await bootstrap();
    // Get the underlying HTTP adapter and delegate the request
    const httpAdapter = instance.getHttpAdapter();
    httpAdapter.getInstance()(req, res);
  } catch (err: any) {
    console.error('Bootstrap error:', err?.message || err);
    res.statusCode = 500;
    res.end(JSON.stringify({
      statusCode: 500,
      message: 'Server initialization error',
      error: process.env.NODE_ENV !== 'production' ? String(err?.message) : 'Internal Server Error',
    }));
  }
};
