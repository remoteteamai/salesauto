import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProspectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.prospect.findMany({ where: { organizationId } });
  }

  async findOne(id: string, organizationId: string) {
    const prospect = await this.prisma.prospect.findFirst({ where: { id, organizationId } });
    if (!prospect) {
      throw new NotFoundException(`Prospect with id ${id} not found`);
    }
    return prospect;
  }

  async create(organizationId: string, data: any) {
    return this.prisma.prospect.create({ data: { ...data, organizationId } });
  }

  async update(id: string, organizationId: string, data: any) {
    const prospect = await this.prisma.prospect.findFirst({ where: { id, organizationId } });
    if (!prospect) {
      throw new NotFoundException(`Prospect with id ${id} not found`);
    }
    return this.prisma.prospect.update({ where: { id }, data });
  }

  async delete(id: string, organizationId: string) {
    const prospect = await this.prisma.prospect.findFirst({ where: { id, organizationId } });
    if (!prospect) {
      throw new NotFoundException(`Prospect with id ${id} not found`);
    }
    return this.prisma.prospect.delete({ where: { id } });
  }
}
