import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamsService } from './teams.service';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  async create(@Body() body: { organizationId: string; name: string }) {
    return this.teamsService.create(body.organizationId, body);
  }

  @Get()
  async list(@Body() body: { organizationId: string }) {
    return this.teamsService.list(body.organizationId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.teamsService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.teamsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.teamsService.delete(id);
  }

  @Get(':id/members')
  async getTeamMembers(@Param('id') id: string) {
    return this.teamsService.getTeamMembers(id);
  }

  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body() data: any) {
    return this.teamsService.addMember(id, data);
  }

  @Delete(':id/members/:memberId')
  async removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.teamsService.removeMember(id, memberId);
  }
}
