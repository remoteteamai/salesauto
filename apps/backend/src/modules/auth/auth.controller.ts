import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService, AuthUser } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = req.headers['x-forwarded-for'] as string || 'unknown';
    const userAgent = req.headers['user-agent'];
    return this.authService.login(dto, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser() user: AuthUser, @Req() req: Request) {
    const sessionId = (req as any).sessionId;
    if (sessionId) {
      await this.authService.logout(sessionId);
    }
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return { message: 'If an account exists with this email, a password reset link has been sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { message: 'Password has been reset successfully' };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user.id, dto);
    return { message: 'Password changed successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getMe(@CurrentUser() user: AuthUser) {
    return { user };
  }

  @Get('oauth/google')
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiQuery({ name: 'redirect_uri', required: false })
  async googleAuth(@Query('redirect_uri') redirectUri?: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUriFinal = redirectUri || `${process.env.APP_URL}/auth/callback/google`;
    const scope = encodeURIComponent('email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUriFinal)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    return { authUrl };
  }

  @Post('oauth/google/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  async googleCallback(@Body() body: { code: string }) {
    // This would exchange the code for tokens with Google
    // For now, return a placeholder - implement with actual Google API
    return { message: 'OAuth callback received', code: body.code };
  }

  @Get('oauth/microsoft')
  @ApiOperation({ summary: 'Initiate Microsoft OAuth flow' })
  async microsoftAuth() {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const redirectUri = `${process.env.APP_URL}/auth/callback/microsoft`;
    const scope = encodeURIComponent('email profile openid');
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    return { authUrl };
  }
}