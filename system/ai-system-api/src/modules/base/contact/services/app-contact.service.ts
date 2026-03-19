import { Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContactRepository } from '../repositories';
import { ContactEntity } from '../entities';
import { CreateContactDto, UpdateContactDto, QueryContactDto, OutputContactDto } from '../dto';
import { plainToInstance } from 'class-transformer';

/**
 * 地址服务
 *
 * 提供地址的创建、管理、查询等业务逻辑
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly repo: ContactRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建地址
   */
  async create(dto: CreateContactDto, userId: string): Promise<ContactEntity> {
    return this.dataSource.transaction(async manager => {
      // 如果要设为默认地址，先取消其他默认地址
      if (dto.isDefault) {
        await this.repo.unsetDefaultByUserId(userId);
      }

      // 创建联系实体
      const contact = this.repo.create(dto);
      contact.userId = userId;

      const savedContact = await manager.save(ContactEntity, contact);

      this.logger.log(`联系创建成功: ${savedContact.id} by ${userId}`);

      return savedContact;
    });
  }

  /**
   * 更新地址
   */
  async update(id: string, dto: UpdateContactDto, userId: string): Promise<ContactEntity> {
    const contact = await this.repo.findById(id);

    // 检查所有权
    if (contact.userId !== userId) {
      throw new ForbiddenException('无权操作此地址');
    }

    return this.dataSource.transaction(async manager => {
      // 如果要设为默认地址，先取消其他默认地址
      if (dto.isDefault === true) {
        await this.repo.unsetDefaultByUserId(userId);
      }
      // 更新地址信息
      const updatedContact = this.repo.merge(contact, dto);
      const savedContact = await manager.save(ContactEntity, updatedContact);
      this.logger.log(`联系更新成功: ${id}`);
      return savedContact;
    });
  }

  /**
   * 删除地址
   */
  async delete(id: string, userId: string) {
    const contact = await this.repo.findById(id);

    if (contact.userId !== userId) {
      throw new ForbiddenException('无权操作此地址');
    }

    await this.repo.remove(contact);

    this.logger.log(`联系删除成功: ${id}`);
  }

  /**
   * 获取地址详情
   */
  async getById(id: string, userId: string): Promise<OutputContactDto> {
    const contact = await this.repo.findById(id);

    if (contact.userId !== userId) {
      throw new ForbiddenException('无权查看此联系');
    }

    return plainToInstance(OutputContactDto, contact, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 获取我的地址列表
   */
  async getMyContacts(userId: string, dto: QueryContactDto): Promise<{ data: OutputContactDto[]; meta: any }> {
    let contacts: ContactEntity[];
    let total: number;

    if (dto.isDefault === true) {
      // 只查询默认地址
      const defaultContact = await this.repo.findDefaultByUserId(userId);
      contacts = defaultContact ? [defaultContact] : [];
      total = defaultContact ? 1 : 0;
    } else {
      // 查询所有地址
      const result = await this.repo.findAndCount({
        where: {
          userId,
        },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
        skip: dto.page * dto.pageSize,
        take: dto.pageSize,
      });
      contacts = result[0];
      total = result[1];
    }

    const listItems = plainToInstance(OutputContactDto, contacts, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    return {
      data: listItems,
      meta: { total },
    };
  }

  /**
   * 设置默认地址
   */
  async setDefault(id: string, userId: string): Promise<ContactEntity> {
    const contact = await this.repo.findById(id);

    if (contact.userId !== userId) {
      throw new ForbiddenException('无权操作此地址');
    }

    if (contact.isDefault) {
      throw new BadRequestException('该联系已是默认联系');
    }

    return this.dataSource.transaction(async manager => {
      // 取消其他默认地址
      await this.repo.unsetDefaultByUserId(userId);

      // 设置当前地址为默认
      contact.isDefault = true;
      const savedContact = await manager.save(ContactEntity, contact);

      this.logger.log(`设置默认联系成功: ${id}`);

      return savedContact;
    });
  }

  /**
   * 获取默认地址
   */
  async getDefault(userId: string): Promise<OutputContactDto | null> {
    const contact = await this.repo.findDefaultByUserId(userId);

    if (!contact) {
      return null;
    }

    return plainToInstance(OutputContactDto, contact, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}
