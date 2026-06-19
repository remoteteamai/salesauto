import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FeatureFlagService {
  constructor(private readonly prisma: PrismaService) {}

  async isEnabled(key: string, organizationId?: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!flag) return false;

    // Check organization-specific overrides
    if (organizationId && flag.metadata) {
      const meta = flag.metadata as any;
      if (meta.organizationOverrides?.[organizationId] !== undefined) {
        return meta.organizationOverrides[organizationId];
      }
    }

    return flag.isEnabled;
  }

  async getAll() {
    return this.prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async setFlag(key: string, isEnabled: boolean, description?: string) {
    return this.prisma.featureFlag.upsert({
      where: { key },
      create: { key, name: key, isEnabled, description },
      update: { isEnabled, description },
    });
  }

  async setOrganizationOverride(
    key: string,
    organizationId: string,
    isEnabled: boolean,
  ) {
    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) {
      throw new NotFoundException(`Feature flag with key ${key} not found`);
    }

    const meta = (flag.metadata as any) || {};
    meta.organizationOverrides = meta.organizationOverrides || {};
    meta.organizationOverrides[organizationId] = isEnabled;

    return this.prisma.featureFlag.update({
      where: { key },
      data: { metadata: meta },
    });
  }
}