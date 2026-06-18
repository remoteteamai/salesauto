import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { MailService } from '../email/mail.service';
import { AuditLogService } from '../admin/audit-log.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string | null;
  isSuperAdmin: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly mailService: MailService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create organization first
    const organization = await this.prisma.organization.create({
      data: {
        name: dto.organizationName,
        slug: this.generateSlug(dto.organizationName),
      },
    });

    // Create user with hashed password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        organizationId: organization.id,
        // Set trial subscription
        organization: {
          update: {
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationId: true,
        isSuperAdmin: true,
      },
    });

    // Create default team
    await this.prisma.team.create({
      data: {
        name: 'Default Team',
        organizationId: organization.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    await this.createSession(user.id, tokens.refreshToken);

    // Send welcome email
    await this.mailService.sendWelcomeEmail(user.email, user.firstName);

    // Audit log
    await this.auditLogService.log({
      userId: user.id,
      organizationId: organization.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
    });

    this.logger.log(`New user registered: ${user.email}`, 'Auth');

    return { user, tokens };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    const tokens = await this.generateTokens(user);

    // Create session
    await this.createSession(user.id, tokens.refreshToken, ipAddress, userAgent);

    // Audit log
    await this.auditLogService.log({
      userId: user.id,
      organizationId: user.organizationId ?? undefined,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
    });

    this.logger.log(`User logged in: ${user.email}`, 'Auth');

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        isSuperAdmin: user.isSuperAdmin,
      },
      tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthTokens> {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: dto.refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      organizationId: session.user.organizationId,
      isSuperAdmin: session.user.isSuperAdmin,
    };

    // Delete old session and create new one
    await this.prisma.session.delete({
      where: { id: session.id },
    });

    const tokens = await this.generateTokens(user);
    await this.createSession(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        metadata: {
          ...(user.metadata as object || {}),
          resetToken,
          resetTokenExpiry: resetTokenExpiry.toISOString(),
        },
      },
    });

    // Send reset email
    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken,
    );

    this.logger.log(`Password reset requested for: ${user.email}`, 'Auth');
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        metadata: {
          path: ['resetToken'],
          equals: dto.token,
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const metadata = user.metadata as any;
    const resetTokenExpiry = new Date(metadata.resetTokenExpiry);

    if (resetTokenExpiry < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        metadata: {
          ...metadata,
          resetToken: null,
          resetTokenExpiry: null,
        },
      },
    });

    // Invalidate all sessions
    await this.prisma.session.deleteMany({
      where: { userId: user.id },
    });

    this.logger.log(`Password reset completed for: ${user.email}`, 'Auth');
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Password not set');
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all sessions except current
    await this.prisma.session.deleteMany({
      where: {
        userId,
      },
    });

    this.logger.log(`Password changed for user: ${userId}`, 'Auth');
  }

  async validateOAuthUser(
    provider: 'GOOGLE' | 'MICROSOFT',
    providerId: string,
    email: string,
    firstName: string,
    lastName: string,
    avatar?: string,
  ): Promise<{ user: AuthUser; tokens: AuthTokens; isNewUser: boolean }> {
    let socialAccount = await this.prisma.socialAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: { user: true },
    });

    let isNewUser = false;

    if (!socialAccount) {
      // Check if user exists with this email
      let user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Create new user and organization
        const organization = await this.prisma.organization.create({
          data: {
            name: `${firstName}'s Organization`,
            slug: this.generateSlug(`${firstName}-organization`),
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        });

        user = await this.prisma.user.create({
          data: {
            email: email.toLowerCase(),
            firstName,
            lastName,
            avatar,
            organizationId: organization.id,
            emailVerified: true,
          },
        });

        // Create default team
        await this.prisma.team.create({
          data: {
            name: 'Default Team',
            organizationId: organization.id,
            members: {
              create: {
                userId: user.id,
                role: 'OWNER',
              },
            },
          },
        });

        isNewUser = true;
      }

      // Create social account link
      socialAccount = await this.prisma.socialAccount.create({
        data: {
          userId: user.id,
          provider,
          providerId,
          accessToken: '',
        },
        include: { user: true },
      });
    }

    const tokens = await this.generateTokens({
      id: socialAccount.user.id,
      email: socialAccount.user.email,
      firstName: socialAccount.user.firstName,
      lastName: socialAccount.user.lastName,
      organizationId: socialAccount.user.organizationId,
      isSuperAdmin: socialAccount.user.isSuperAdmin,
    });

    await this.createSession(socialAccount.user.id, tokens.refreshToken);

    return {
      user: {
        id: socialAccount.user.id,
        email: socialAccount.user.email,
        firstName: socialAccount.user.firstName,
        lastName: socialAccount.user.lastName,
        organizationId: socialAccount.user.organizationId,
        isSuperAdmin: socialAccount.user.isSuperAdmin,
      },
      tokens,
      isNewUser,
    };
  }

  private async generateTokens(user: AuthUser): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.session.create({
      data: {
        userId,
        token: uuidv4(),
        refreshToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });
  }

  private generateSlug(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    return `${slug}-${Date.now().toString(36)}`;
  }
}