import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProspectsService } from './prospects.service';

@Controller('prospects')
@UseGuards(JwtAuthGuard)
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Get()
  async findAll(@Query('organizationId') organizationId: string) {
    return this.prospectsService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('organizationId') organizationId: string) {
    return this.prospectsService.findOne(id, organizationId);
  }

  @Post()
  async create(@Body() data: any) {
    return this.prospectsService.create(data.organizationId, data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.prospectsService.update(id, data.organizationId, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Query('organizationId') organizationId: string) {
    return this.prospectsService.delete(id, organizationId);
  }
}
