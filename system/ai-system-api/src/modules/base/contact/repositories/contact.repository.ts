import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { ContactEntity } from '../entities';

/**
 * 地址仓储
 *
 * 负责地址的数据访问操作
 */
@Injectable()
export class ContactRepository extends Repository<ContactEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ContactEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找地址
   */
  async findById(id: string, options?: FindOneOptions<ContactEntity>) {
    const contact = await this.findOne({
      ...options,
      where: { ...options?.where, id },
    });
    if (!contact) {
      throw new NotFoundException('地址不存在');
    }
    return contact;
  }

  /**
   * 根据用户 ID 查找所有地址
   */
  async findByUserId(userId: string): Promise<ContactEntity[]> {
    return this.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * 根据用户 ID 查找默认地址
   */
  async findDefaultByUserId(userId: string): Promise<ContactEntity | null> {
    return this.findOne({
      where: { userId, isDefault: true },
    });
  }

  /**
   * 检查地址是否属于指定用户
   */
  async isOwnedBy(addressId: string, userId: string): Promise<boolean> {
    const count = await this.count({
      where: { id: addressId, userId },
    });
    return count > 0;
  }

  /**
   * 取消用户的所有默认地址
   */
  async unsetDefaultByUserId(userId: string): Promise<void> {
    await this.update({ userId, isDefault: true }, { isDefault: false });
  }
}
