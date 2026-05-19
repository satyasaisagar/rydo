import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID', 'google-client-id'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET', 'google-client-secret'),
      callbackURL: `${configService.get('APP_URL', 'http://localhost:4000')}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { id, displayName, emails, photos } = profile;
    done(null, { id, displayName, email: emails[0].value, photo: photos[0]?.value });
  }
}
