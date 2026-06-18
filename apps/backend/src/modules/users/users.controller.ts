import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      jobTitle?: string;
      timezone?: string;
      locale?: string;
    },
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Avatar updated' })
  async updateAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // In production, upload to S3 and get URL
    const avatarUrl = file ? `/uploads/avatars/${file.filename}` : null;
    return this.usersService.updateAvatar(user.id, avatarUrl);
  }

  @Get()
  @ApiOperation({ summary: 'List users in organization' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async listUsers(
    @CurrentUser() user: AuthUser,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.listUsers(user.organizationId, {
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}