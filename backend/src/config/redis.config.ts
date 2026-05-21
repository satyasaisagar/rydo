import { ConfigService } from '@nestjs/config';

/**
 * Redis / Upstash Configuration for Vercel
 *
 * Vercel + Upstash Redis injects:
 *   KV_URL            — redis://... connection string
 *   KV_REST_API_URL   — REST API URL
 *   KV_REST_API_TOKEN — REST API token
 *   REDIS_URL         — alias
 *
 * Local Docker dev uses REDIS_HOST / REDIS_PORT.
 */
export const getRedisConfig = (configService: ConfigService) => {
  const redisUrl =
    configService.get('KV_URL') ||
    configService.get('REDIS_URL') ||
    configService.get('UPSTASH_REDIS_REST_URL');

  if (redisUrl) {
    return { url: redisUrl };
  }

  return {
    host:     configService.get('REDIS_HOST',     'localhost'),
    port:     configService.get<number>('REDIS_PORT', 6379),
    password: configService.get('REDIS_PASSWORD') || undefined,
  };
};
