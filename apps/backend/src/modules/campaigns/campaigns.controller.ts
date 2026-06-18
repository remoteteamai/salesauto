import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  async findAll(@Query('organizationId') organizationId: string) {
    return this.campaignsService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('organizationId') organizationId: string) {
    return this.campaignsService.findOne(id, organizationId);
  }

  @Post()
  async create(@Body() data: any) {
    return this.campaignsService.create(data.organizationId, data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.campaignsService.update(id, data.organizationId, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Query('organizationId') organizationId: string) {
    return this.campaignsService.delete(id, organizationId);
  }
}
