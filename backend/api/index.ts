import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import type { Request, Response } from 'express';

let app: any;
let bootstrapping = false;
let bootstrapError: Error | null = null;

async function bootstrap() {
  if (app) return app;
  if (bootstrapError) throw bootstrapError;

  // Wait if already bootstrapping (concurrent cold starts)
  if (bootstrapping) {
    await new Promise(r => setTimeout(r, 200));
    return bootstrap();
  }

  bootstrapping = true;
  try {
    const instance = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
      // Never crash on error — let TypeORM retry in background
      abortOnError: false,
    });

    instance.use(helmet({ contentSecurityPolicy: false }));

    instance.enableCors({
      origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
        const allowed =
          !origin ||
          /\.vercel\.app$/.test(origin) ||
          /localhost(:\d+)?$/.test(origin) ||
          origin === (process.env.FRONTEND_URL || '');
        cb(null, allowed);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    instance.setGlobalPrefix('api');

    instance.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    // Swagger docs
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Rydo API')
      .setDescription(
        'Rydo Ride Sharing Platform — REST API\n\n' +
        '**Note:** Connect a Vercel Postgres database to enable all endpoints.',
      )
      .setVersion('2.0')
      .addServer('https://rydo-backend-mocha.vercel.app', 'Production')
      .addServer('http://localhost:4000', 'Local')
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

    // init() starts listening but doesn't throw on DB errors (abortOnError: false)
    await instance.init();

    app = instance;
    return app;
  } catch (err: any) {
    bootstrapError = err;
    throw err;
  } finally {
    bootstrapping = false;
  }
}

export default async (req: Request, res: Response) => {
  try {
    const instance = await bootstrap();
    instance.getHttpAdapter().getInstance()(req, res);
  } catch (err: any) {
    const msg = String(err?.message || err);
    console.error('Bootstrap error:', msg);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 503;
    res.end(JSON.stringify({
      statusCode: 503,
      message: 'Service temporarily unavailable',
      hint: msg.includes('ECONNREFUSED') || msg.includes('connect')
        ? 'Database not connected. Add POSTGRES_URL in Vercel project settings.'
        : msg,
    }));
  }
};
