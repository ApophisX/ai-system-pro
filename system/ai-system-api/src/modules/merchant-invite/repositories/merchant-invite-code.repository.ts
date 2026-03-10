import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MerchantInviteCodeEntity } from '../entities';

@Injectable()
export class MerchantInviteCodeRepository extends Repository<MerchantInviteCodeEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(MerchantInviteCodeEntity, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<MerchantInviteCodeEntity | null> {
    return this.findOne({
      where: { code, isActive: true },
    });
  }

  async findByEmployeeId(employeeId: string): Promise<MerchantInviteCodeEntity | null> {
    return this.findOne({
      where: { employeeId, isActive: true },
    });
  }

  async findOrCreateByEmployeeId(employeeId: string): Promise<MerchantInviteCodeEntity> {
    const code = await this.findByEmployeeId(employeeId);
    if (code) return code;
    for (let i = 0; i < 5; i++) {
      const newCode = this.create({
        employeeId,
        code: this.generateInviteCode(),
      });
      try {
        return await this.save(newCode);
      } catch (e: unknown) {
        const err = e as { code?: string };
        if (err?.code === 'ER_DUP_ENTRY' && i < 4) continue;
        throw e;
      }
    }
    throw new Error('无法生成唯一邀请码');
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
