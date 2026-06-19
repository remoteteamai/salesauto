import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor() {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID || 'demo-client-id',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'demo-client-secret',
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3001/api/auth/microsoft/callback',
      scope: ['user.read'],
      tenant: process.env.MICROSOFT_TENANT_ID || 'common',
      authorizationURL: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}/oauth2/v2.0/token`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const user = {
      email: profile?.emails?.[0]?.value || profile?._json?.mail || profile?._json?.userPrincipalName || '',
      name: profile?.displayName || '',
      picture: '',
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
