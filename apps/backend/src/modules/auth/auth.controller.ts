import { Controller, Post, Get, Body, UseGuards, Req, Res, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; firstName: string; lastName: string }) {
    return this.authService.register(body.email, body.password, body.firstName, body.lastName);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      return await this.authService.login(body.email, body.password);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  // Google OAuth - Gmail Login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as { email: string; name: string; picture?: string; accessToken?: string; refreshToken?: string };
    const result = await this.authService.handleOAuthLogin({
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: 'GOOGLE',
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
  }

  // Microsoft OAuth - Work Email Login
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth() {
    // Initiates Microsoft OAuth flow
  }

  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as { email: string; name: string; picture?: string; accessToken?: string; refreshToken?: string };
    const result = await this.authService.handleOAuthLogin({
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: 'MICROSOFT',
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.authService.validateUser(user.id);
  }
}
