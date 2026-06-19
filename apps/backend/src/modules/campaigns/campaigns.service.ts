import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.campaign.findMany({ where: { organizationId } });
  }

  async findOne(id: string, organizationId: string) {
    const campaign = await this.prisma.campaign.findFirst({ where: { id, organizationId } });
    if (!campaign) {
      throw new NotFoundException(`Campaign with id ${id} not found`);
    }
    return campaign;
  }

  async create(organizationId: string, data: any) {
    return this.prisma.campaign.create({
      data: { ...data, organizationId },
    });
  }

  async update(id: string, organizationId: string, data: any) {
    const campaign = await this.prisma.campaign.findFirst({ where: { id, organizationId } });
    if (!campaign) {
      throw new NotFoundException(`Campaign with id ${id} not found`);
    }
    return this.prisma.campaign.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    const campaign = await this.prisma.campaign.findFirst({ where: { id, organizationId } });
    if (!campaign) {
      throw new NotFoundException(`Campaign with id ${id} not found`);
    }
    return this.prisma.campaign.delete({ where: { id } });
  }
}
