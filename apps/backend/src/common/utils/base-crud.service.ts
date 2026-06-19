import { PrismaService } from '../../database/prisma.service';

export type PrismaDelegate = {
  findMany: (args?: any) => Promise<any[]>;
  findFirst: (args?: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
};

export abstract class BaseCrudService {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract getDelegate(): PrismaDelegate;

  async findAll(organizationId: string) {
    return this.getDelegate().findMany({ where: { organizationId } });
  }

  async findOne(id: string, organizationId: string) {
    return this.getDelegate().findFirst({ where: { id, organizationId } });
  }

  async create(organizationId: string, data: any) {
    return this.getDelegate().create({
      data: { ...data, organizationId },
    });
  }

  async update(id: string, data: any) {
    return this.getDelegate().update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.getDelegate().delete({ where: { id } });
  }
}
