// src/infrastructure/database/entities/base.entity.ts
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { TransformDateString } from '@/common/decorators/trasform.decorator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

/**
 * BaseEntity 内部/审计字段，Output DTO 使用 OmitType 时可统一 omit 此常量，避免重复硬编码
 */
export const BASE_ENTITY_OMIT_FIELDS = [
  'deletedAt',
  'version',
  'updatedBy',
  'updateById',
  'createdBy',
  'createdById',
  'deletedBy',
  'deletedById',
  'isActive',
  'remark',
  'updatedAt',
] as const;

abstract class BaseEntityCommon {
  @ApiProperty({ description: '创建时间' })
  @Expose()
  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  @TransformDateString()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @Expose()
  @TransformDateString()
  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', comment: '删除时间' })
  deletedAt?: Date;

  @VersionColumn({ default: 1, comment: '乐观锁版本号' })
  version: number;

  @Column({ length: 50, nullable: true, comment: '更新者' })
  updatedBy?: string;

  @Column({ length: 50, nullable: true, comment: '更新者 ID' })
  updateById?: string;

  @Column({ length: 50, nullable: true, comment: '创建者' })
  createdBy?: string;

  @Column({ length: 50, nullable: true, comment: '创建者 ID' })
  createdById?: string;

  @Column({ length: 50, nullable: true, comment: '删除者' })
  deletedBy?: string;

  @Column({ length: 50, nullable: true, comment: '删除者 ID' })
  deletedById?: string;

  @ApiPropertyOptional({ description: '是否有效', default: true })
  @Expose()
  @Index()
  @Column({ type: 'boolean', default: true, comment: '是否有效' })
  @IsOptional()
  isActive: boolean = true;

  @ApiPropertyOptional({ description: '备注' })
  @Expose()
  @Column({
    type: 'text',
    nullable: true,
    comment: '备注',
  })
  remark?: string;

  @Exclude()
  @BeforeInsert()
  updateUpdateAt(): void {
    this.updatedAt = new Date();
  }
}

/**
 * 基础实体类
 *
 * 所有 ORM Entity 的基类，包含通用字段：
 * - id: 主键（UUID）
 */
export abstract class BaseEntity extends BaseEntityCommon {
  @ApiProperty({ description: '主键 ID（UUID）' })
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '主键 ID（UUID）' })
  @Expose()
  id: string;
}

/**
 * 基础实体类，使用自增主键
 *
 * 所有 ORM Entity 的基类，包含通用字段：
 * - id: 主键（自增）
 */
export abstract class BaseEntityWithNumericId extends BaseEntityCommon {
  @PrimaryGeneratedColumn('increment', {
    name: 'id',
    comment: '主键 ID（自增）',
  })
  @ApiProperty({ description: '主键 ID（自增）' })
  @Expose()
  id: number;
}

/**
 * 基础地区实体类（UUID 主键）
 *
 * 包含地区信息的实体基类，适用于使用 UUID 作为主键的实体
 */
export abstract class BaseAreaEntity extends BaseEntity {
  @ApiProperty({ description: '省份名称', example: '广东省' })
  @IsNotEmpty()
  @Expose()
  @Column({ length: 50, nullable: true, comment: '省份名称' })
  province: string;

  @ApiProperty({ description: '省份代码', example: '440000' })
  @IsNotEmpty()
  @Expose()
  @Column({ length: 20, nullable: true, comment: '省份代码' })
  provinceCode: string;

  @ApiProperty({ description: '城市名称', example: '深圳市' })
  @IsNotEmpty()
  @Expose()
  @Column({ length: 50, nullable: true, comment: '城市名称' })
  city: string;

  @ApiProperty({ description: '城市代码', example: '440300' })
  @IsNotEmpty()
  @Expose()
  @Column({ length: 20, nullable: true, comment: '城市代码' })
  cityCode: string;

  @ApiProperty({ description: '区县名称', example: '南山区' })
  @IsNotEmpty()
  @Expose()
  @Column({ length: 50, nullable: true, comment: '区县名称' })
  district: string;

  @ApiProperty({ description: '区县代码', example: '440305' })
  @IsNotEmpty()
  @Expose()
  @Column({ length: 20, nullable: true, comment: '区县代码' })
  districtCode: string;

  @ApiProperty({
    description: '详细地址',
    example: '科技园南区高新南四道18号',
    required: false,
  })
  @IsNotEmpty()
  @Expose()
  @Column({ length: 255, nullable: true, comment: '详细地址' })
  address: string;

  @ApiProperty({
    description: '地址名称',
    example: '张三的地址',
    required: false,
  })
  @IsNotEmpty()
  @Expose()
  @Column({ length: 100, nullable: true, comment: '地址名称' })
  addressName: string;

  @IsOptional()
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: '经度',
    optional: true,
  })
  longitude: number;

  @IsOptional()
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: '纬度',
  })
  latitude: number;

  // @ColumnWithApi({
  //   type: 'decimal',
  //   precision: 10,
  //   scale: 6,
  //   nullable: true,
  //   comment: '距离',
  //   optional: true,
  // })
  // @Expose()
  // distance: number;
}

/**
 * 基础地区实体类（自增主键）
 *
 * 包含地区信息的实体基类，适用于使用自增数字作为主键的实体
 */
export abstract class BaseAreaNumericIdEntity extends BaseEntityWithNumericId {
  @ApiProperty({ description: '省份名称', example: '广东省', required: false })
  @Expose()
  @Column({ length: 50, nullable: true, comment: '省份名称' })
  province: string;

  @ApiProperty({ description: '省份代码', example: '440000', required: false })
  @Expose()
  @Column({ length: 20, nullable: true, comment: '省份代码' })
  provinceCode: string;

  @ApiProperty({ description: '城市名称', example: '深圳市', required: false })
  @Expose()
  @Column({ length: 50, nullable: true, comment: '城市名称' })
  city: string;

  @ApiProperty({ description: '城市代码', example: '440300', required: false })
  @Expose()
  @Column({ length: 20, nullable: true, comment: '城市代码' })
  cityCode: string;

  @ApiProperty({ description: '区县名称', example: '南山区', required: false })
  @Expose()
  @Column({ length: 50, nullable: true, comment: '区县名称' })
  district: string;

  @ApiProperty({ description: '区县代码', example: '440305', required: false })
  @Expose()
  @Column({ length: 20, nullable: true, comment: '区县代码' })
  districtCode: string;
}
