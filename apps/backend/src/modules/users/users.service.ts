import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return this.prisma.user.findUnique({ where: { id }, include: { organization: true } }); }
  async update(id: string, data: any) { return this.prisma.user.update({ where: { id }, data }); }
  async listUsers(organizationId: string) { return this.prisma.user.findMany({ where: { organizationId } }); }
}
