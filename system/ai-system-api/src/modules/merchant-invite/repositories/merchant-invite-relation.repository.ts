import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MerchantInviteRelationEntity } from '../entities';
import { MerchantInviteRelationStatus } from '../enums';

@Injectable()
export class MerchantInviteRelationRepository extends Repository<MerchantInviteRelationEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(MerchantInviteRelationEntity, dataSource.createEntityManager());
  }

  async findByMerchantId(merchantId: string): Promise<MerchantInviteRelationEntity | null> {
    return this.findOne({ where: { merchantId } });
  }

  async findByEmployeeId(
    employeeId: string,
    options?: { skip?: number; take?: number },
  ): Promise<[MerchantInviteRelationEntity[], number]> {
    const qb = this.createQueryBuilder('r')
      .where('r.employeeId = :employeeId', { employeeId })
      .orderBy('r.createdAt', 'DESC');
    if (options?.skip !== undefined) qb.skip(options.skip);
    if (options?.take !== undefined) qb.take(options.take);
    return qb.getManyAndCount();
  }

  async countByEmployeeIdAndStatus(employeeId: string, status: MerchantInviteRelationStatus): Promise<number> {
    return this.count({ where: { employeeId, status } });
  }
}
