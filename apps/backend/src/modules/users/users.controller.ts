import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Body() body: { userId: string }) {
    return this.usersService.findById(body.userId);
  }

  @Put('me')
  async updateProfile(@Body() body: any) {
    return this.usersService.update(body.userId, body);
  }
}
