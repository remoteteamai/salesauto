import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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
        organization: {
          create: {
            name: `${firstName}'s Organization`,
            slug: email.split('@')[0] + '-' + Date.now(),
          },
        },
      },
      include: { organization: true },
    });
    const token = this.jwtService.sign({ sub: user.id, email: user.email, organizationId: user.organizationId });
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: user.id, email: user.email, organizationId: user.organizationId });
    return { user, token };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });
  }
}

export interface AuthUser {
  id: string;
  email: string;
  organizationId: string;
  role: string;
}
