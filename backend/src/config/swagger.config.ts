import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Rydo API')
    .setDescription(
      `## Rydo Ride Sharing Platform — REST API

### Authentication
All protected endpoints require a Bearer JWT token.
Use \`POST /api/auth/login\` to obtain tokens.

### Rate Limiting
- General endpoints: 100 req/min
- Auth endpoints: 10 req/min

### WebSocket
Connect to \`/chat\` namespace with \`auth: { userId }\` for real-time chat.
      `
    )
    .setVersion('2.0.0')
    .setContact('Rydo Team', 'https://rydo.app', 'api@rydo.app')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:4000', 'Local Development')
    .addServer('https://api.rydo.app', 'Production')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT-auth',
    )
    .addTag('Auth',          'Registration, login, OTP, OAuth')
    .addTag('Users',         'Profile management and vehicles')
    .addTag('Rides',         'Offer, search and manage rides')
    .addTag('Bookings',      'Booking requests and status updates')
    .addTag('Chats',         'Messaging between riders and passengers')
    .addTag('Ratings',       'Reviews and star ratings')
    .addTag('Notifications', 'In-app notification management')
    .addTag('Admin',         'CRM dashboard and moderation')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Rydo API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { background: #0A0A0A; }
      .swagger-ui .topbar-wrapper .link { display: none; }
    `,
  });

  // Also expose raw JSON at /api/docs-json (built-in)
}
