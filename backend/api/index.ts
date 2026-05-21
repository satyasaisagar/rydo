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

// Fully custom Swagger HTML — loads assets entirely from unpkg CDN
// Avoids NestJS default template which references broken ./docs/... local paths
function buildSwaggerHtml(jsonUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rydo API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
  <style>
    body { margin: 0; background: #1a1a1a; }
    .swagger-ui .topbar { background: #0A0A0A; border-bottom: 1px solid #333; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info .title { color: #00C853; }
  </style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
<script>
  window.onload = function() {
    SwaggerUIBundle({
      url: "${jsonUrl}",
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      plugins: [SwaggerUIBundle.plugins.DownloadUrl],
      layout: "StandaloneLayout",
      persistAuthorization: true,
      docExpansion: "none",
      filter: true,
      showRequestDuration: true,
      deepLinking: true
    });
  };
</script>
</body>
</html>`;
}

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

    // Build Swagger JSON document
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

    const document = SwaggerModule.createDocument(instance, swaggerConfig);

    // Register /api/docs-json — raw OpenAPI spec
    SwaggerModule.setup('api/docs', instance, document);

    await instance.init();

    // Override /api/docs GET to serve our custom CDN-based HTML
    // This runs AFTER NestJS registers its own /api/docs route,
    // so we add our raw express handler that intercepts the exact path
    const expressApp = instance.getHttpAdapter().getInstance();
    expressApp.get('/api/docs', (_req: any, res: any) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(buildSwaggerHtml('/api/docs-json'));
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
