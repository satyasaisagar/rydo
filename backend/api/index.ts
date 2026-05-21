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
let openApiDocument: any = null;

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rydo API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
  <style>
    body { margin: 0; background: #1a1a1a; }
    .swagger-ui .topbar { background: #0A0A0A; border-bottom: 1px solid #2a2a2a; padding: 8px 16px; }
    .swagger-ui .topbar-wrapper { display: flex; align-items: center; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info .title { color: #00C853; font-size: 2rem; }
    .swagger-ui .info .description p { color: #aaa; }
    .swagger-ui .scheme-container { background: #1a1a1a; padding: 16px; box-shadow: none; border-bottom: 1px solid #333; }
    .swagger-ui select, .swagger-ui input[type=text], .swagger-ui textarea { background: #2a2a2a; color: #fff; border-color: #444; }
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
    dom_id: '#swagger-ui',
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
    await new Promise(r => setTimeout(r, 200));
    return bootstrap();
  }

  bootstrapping = true;
  try {
    const instance = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
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

    // Build OpenAPI document (but do NOT call SwaggerModule.setup)
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

    // Manually serve docs via raw Express — registered AFTER init()
    // Use instance.use() which wraps the underlying Express app.use()
    const expressApp = instance.getHttpAdapter().getInstance();

    // Serve custom Swagger HTML at /api/docs
    expressApp.get('/api/docs', (_req: any, res: any) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(SWAGGER_HTML);
    });

    // Serve OpenAPI JSON spec at /api/docs-json
    expressApp.get('/api/docs-json', (_req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(JSON.stringify(openApiDocument));
    });

    // Serve YAML spec at /api/docs-yaml
    expressApp.get('/api/docs-yaml', (_req: any, res: any) => {
      res.setHeader('Content-Type', 'text/yaml');
      res.setHeader('Cache-Control', 'no-cache');
      // Simple JSON to avoid yaml dep — just return JSON with yaml content-type
      res.end(JSON.stringify(openApiDocument, null, 2));
    });

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
