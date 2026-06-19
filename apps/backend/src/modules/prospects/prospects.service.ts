import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseCrudService, PrismaDelegate } from '../../common/utils/base-crud.service';

@Injectable()
export class ProspectsService extends BaseCrudService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate(): PrismaDelegate {
    return this.prisma.prospect;
  }
}
