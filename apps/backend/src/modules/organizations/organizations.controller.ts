import { Controller, Get, Put, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get(':id')
  async findById(@Param('id') id: string) { return this.organizationsService.findById(id); }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) { return this.organizationsService.update(id, data); }

  @Get(':id/settings')
  async getSettings(@Param('id') id: string) { return this.organizationsService.getSettings(id); }

  @Put(':id/settings')
  async updateSettings(@Param('id') id: string, @Body() settings: any) { return this.organizationsService.updateSettings(id, settings); }

  @Get(':id/icp')
  async listICP(@Param('id') id: string) { return this.organizationsService.listICP(id); }

  @Post(':id/icp')
  async createICP(@Param('id') id: string, @Body() data: any) { return this.organizationsService.createICP(id, data); }
}
