import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MerchantAccountEntity } from '../entities/merchant-account.entity';

@Injectable()
export class MerchantAccountRepository extends Repository<MerchantAccountEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(MerchantAccountEntity, dataSource.createEntityManager());
  }

  /**
   * 根据商家 ID 查询账户（行级锁，用于审核通过时扣款）
   */
  async findByMerchantIdForUpdate(merchantId: string): Promise<MerchantAccountEntity | null> {
    return this.createQueryBuilder('account')
      .where('account.merchantId = :merchantId', { merchantId })
      .setLock('pessimistic_write')
      .getOne();
  }

  /**
   * 根据商家 ID 查询账户
   */
  async findByMerchantId(merchantId: string): Promise<MerchantAccountEntity | null> {
    return this.findOne({ where: { merchantId } });
  }

  /**
   * 创建或获取账户（不存在则创建，初始余额为 0，需外部同步）
   */
  async getOrCreate(merchantId: string): Promise<MerchantAccountEntity> {
    let account = await this.findByMerchantId(merchantId);
    if (!account) {
      account = this.create({
        merchantId,
        totalBalance: '0',
        frozenBalance: '0',
        availableBalance: '0',
      });
      account = await this.save(account);
    }
    return account;
  }
}
