import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return this.prisma.organization.findUnique({ where: { id } }); }
  async findBySlug(slug: string) { return this.prisma.organization.findFirst({ where: { slug } }); }
  async update(id: string, data: any) { return this.prisma.organization.update({ where: { id }, data }); }
  async updateSettings(id: string, settings: any) { return this.update(id, { settings }); }
  async getSettings(id: string) { return (await this.findById(id))?.settings || {}; }
  async uploadLogo(id: string, logo: string) { return this.update(id, { logo }); }
  async getOrganizationStats(id: string) { return { prospects: 0, campaigns: 0 }; }
  async listICP(organizationId: string) { return []; }
  async createICP(organizationId: string, data: any) { return data; }
}
