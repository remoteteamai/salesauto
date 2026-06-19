import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface OAuthLoginPayload {
  email: string;
  name: string;
  picture?: string;
  provider: 'GOOGLE' | 'MICROSOFT';
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  organizationId: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, firstName: string, lastName: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        emailVerified: true,
        organization: {
          create: {
            name: `${firstName}'s Organization`,
            slug: email.split('@')[0] + '-' + Date.now(),
          },
        },
      },
      include: { organization: true },
    });
    const token = this.generateToken(user.id, user.email, user.organizationId);
    return { user: this.sanitizeUser(user), token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    const token = this.generateToken(user.id, user.email, user.organizationId);
    return { user: this.sanitizeUser(user), token };
  }

  async handleOAuthLogin(payload: OAuthLoginPayload) {
    const { email, name, picture, provider, accessToken, refreshToken } = payload;
    const [firstName, ...lastParts] = name.split(' ');
    const lastName = lastParts.join(' ') || firstName;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          avatar: picture,
          emailVerified: true,
          organization: {
            create: {
              name: `${firstName}'s Organization`,
              slug: email.split('@')[0] + '-' + Date.now(),
            },
          },
        },
        include: { organization: true },
      });
    }

    // Upsert social account
    const existingSocial = await this.prisma.socialAccount.findFirst({
      where: { userId: user.id, provider },
    });

    if (existingSocial) {
      await this.prisma.socialAccount.update({
        where: { id: existingSocial.id },
        data: {
          accessToken: accessToken || '',
          refreshToken,
          updatedAt: new Date(),
        },
      });
    } else {
      await this.prisma.socialAccount.create({
        data: {
          userId: user.id,
          provider,
          providerId: email,
          accessToken: accessToken || '',
          refreshToken,
        },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = this.generateToken(user.id, user.email, user.organizationId);
    return { user: this.sanitizeUser(user), token };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
    if (!user) return null;
    return this.sanitizeUser(user);
  }

  private generateToken(userId: string, email: string, organizationId: string | null) {
    return this.jwtService.sign({
      sub: userId,
      email,
      organizationId,
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
