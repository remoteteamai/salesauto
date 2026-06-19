import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return org;
  }

  async findBySlug(slug: string) {
    const org = await this.prisma.organization.findFirst({ where: { slug } });
    if (!org) {
      throw new NotFoundException(`Organization with slug ${slug} not found`);
    }
    return org;
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.organization.update({ where: { id }, data });
  }

  async updateSettings(id: string, settings: any) {
    return this.update(id, { settings });
  }

  async getSettings(id: string) {
    const org = await this.findById(id);
    return org.settings || {};
  }

  async uploadLogo(id: string, logo: string) {
    return this.update(id, { logo });
  }

  async getOrganizationStats(id: string) {
    return { prospects: 0, campaigns: 0 };
  }

  async listICP(organizationId: string) {
    return [];
  }

  async createICP(organizationId: string, data: any) {
    return data;
  }
}
