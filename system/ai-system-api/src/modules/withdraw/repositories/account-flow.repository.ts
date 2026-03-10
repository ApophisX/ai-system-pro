import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AccountFlowEntity } from '../entities/account-flow.entity';

@Injectable()
export class AccountFlowRepository extends Repository<AccountFlowEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AccountFlowEntity, dataSource.createEntityManager());
  }

  /**
   * 根据幂等键查询是否存在（防重复记账）
   */
  async existsByIdempotencyKey(idempotencyKey: string): Promise<boolean> {
    const count = await this.count({ where: { idempotencyKey } });
    return count > 0;
  }
}
