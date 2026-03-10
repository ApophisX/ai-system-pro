import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseAreaEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 联系人实体
 *
 * 用于保存用户的联系信息，包括联系人姓名、联系电话、微信号、邮编等
 */
@Entity('contact')
@Index('IDX_contact_user_default', ['userId', 'isDefault'])
export class ContactEntity extends BaseAreaEntity {
  /**
   * 用户 ID（地址所属用户）
   */
  @Expose()
  @Column({ length: 50, comment: '用户 ID（地址所属用户）', nullable: true })
  @ApiProperty({ description: '用户 ID（地址所属用户）' })
  @Index()
  userId: string;

  /**
   * 联系人姓名
   */
  @Expose()
  @Column({ length: 100, nullable: true, comment: '联系人姓名' })
  @ApiProperty({ description: '联系人姓名' })
  @IsNotEmpty()
  contactName: string;

  /**
   * 联系电话
   */
  @Expose()
  @Column({ length: 20, nullable: true, comment: '联系电话' })
  @ApiProperty({ description: '联系电话' })
  @IsNotEmpty()
  contactPhone: string;

  /**
   * 微信号
   */
  @Expose()
  @Column({ length: 50, nullable: true, comment: '微信号' })
  @IsOptional()
  @ApiPropertyOptional({ description: '微信号' })
  wechat?: string;

  /**
   * 邮编
   */
  @Expose()
  @Column({ length: 10, nullable: true, comment: '邮编' })
  @IsOptional()
  @ApiPropertyOptional({ description: '邮编' })
  postalCode?: string;

  /**
   * 是否默认地址
   */
  @Expose()
  @Column({ type: 'boolean', default: false, comment: '是否默认地址' })
  @IsOptional()
  @ApiProperty({ description: '是否默认地址' })
  isDefault: boolean;

  /**
   * 地址标签（如：家、公司、学校等）
   */
  @Expose()
  @Column({
    length: 50,
    nullable: true,
    comment: '地址标签（如：家、公司、学校等）',
  })
  @IsOptional()
  @ApiPropertyOptional({ description: '地址标签（如：家、公司、学校等）' })
  label?: string;

  /** =========================================== RELATIONS =========================================== */
  /**
   * 用户关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
