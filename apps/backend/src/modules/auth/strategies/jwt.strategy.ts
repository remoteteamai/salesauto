import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { AuthUser } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any): Promise<AuthUser> {
    const sessionId = req.headers['x-session-id'] as string;
    
    // Optionally validate session exists
    if (sessionId) {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
      });
      
      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired or invalid');
      }
    }

    return {
      id: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      isSuperAdmin: payload.isSuperAdmin,
      firstName: '',
      lastName: '',
    };
  }
}