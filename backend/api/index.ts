import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import helmet from 'helmet';
import type { Request, Response } from 'express';

let app: any;
let bootstrapping = false;
let bootstrapError: Error | null = null;
let openApiDocument: any = null;

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rydo API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
  <style>
    body { margin:0; background:#1a1a1a; }
    .swagger-ui .topbar { background:#0A0A0A; border-bottom:1px solid #2a2a2a; }
    .swagger-ui .topbar .download-url-wrapper { display:none; }
    .swagger-ui .info .title { color:#00C853; }
  </style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
<script>
window.onload = function() {
  SwaggerUIBundle({
    url: "/api/docs-json",
    dom_id: "#swagger-ui",
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: "StandaloneLayout",
    persistAuthorization: true,
    docExpansion: "none",
    filter: true,
    showRequestDuration: true,
    deepLinking: true,
    tryItOutEnabled: true
  });
};
</script>
</body>
</html>`;

async function bootstrap() {
  if (app) return app;
  if (bootstrapError) throw bootstrapError;
  if (bootstrapping) {
    await new Promise(r => setTimeout(r, 300));
    return bootstrap();
  }

  bootstrapping = true;
  try {
    const instance = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
      abortOnError: false,
    });

    const expressApp = instance.getHttpAdapter().getInstance();

    // Swagger docs — registered BEFORE NestJS routes take over
    expressApp.get('/api/docs', (_req: any, res: any) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(SWAGGER_HTML);
    });
    expressApp.get('/api/docs-json', (_req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(JSON.stringify(openApiDocument || {}));
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

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Rydo API')
      .setDescription('Rydo Ride Sharing Platform — REST API')
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

    openApiDocument = SwaggerModule.createDocument(instance, swaggerConfig);

    await instance.init();

    // ── Force schema sync on every cold start ─────────────────────────────
    // Vercel serverless: each cold start must ensure tables exist.
    // DataSource.synchronize() is idempotent — only runs ALTER/CREATE
    // when entity metadata differs from actual DB schema.
    try {
      const dataSource = instance.get(DataSource);
      await dataSource.synchronize();
      console.log('[bootstrap] Schema synchronized ✓');
    } catch (syncErr: any) {
      // Log but don't crash — tables may already exist
      console.warn('[bootstrap] Schema sync warning:', syncErr?.message);
    }

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
      error: msg,
    }));
  }
};
