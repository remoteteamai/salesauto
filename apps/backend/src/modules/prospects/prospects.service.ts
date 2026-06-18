import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProspectsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(organizationId: string) { return this.prisma.prospect.findMany({ where: { organizationId } }); }
  async findOne(id: string, organizationId: string) { return this.prisma.prospect.findFirst({ where: { id, organizationId } }); }
  async create(organizationId: string, data: any) { return this.prisma.prospect.create({ data: { ...data, organizationId } }); }
  async update(id: string, data: any) { return this.prisma.prospect.update({ where: { id }, data }); }
  async delete(id: string) { return this.prisma.prospect.delete({ where: { id } }); }
}
