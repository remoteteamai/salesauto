import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor() {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID || 'demo-client-id',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'demo-client-secret',
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || '/auth/microsoft/callback',
      scope: ['User.Read'],
    });
  }
  async validate(accessToken: string, refreshToken: string, profile: any) {
    return { email: profile?.emails?.[0]?.value || '', name: profile?.displayName || '' };
  }
}
