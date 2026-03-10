import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';
import { CommunityEntity } from '../entities';
import { CommunityType, CommunityStatus, CommunityMemberRole } from '../enums';
import { BASE_ENTITY_OMIT_FIELDS } from '@/infrastructure/database/entities/base.entity';

const OMIT_FIELDS = [...BASE_ENTITY_OMIT_FIELDS, 'creator', 'auditBy'] as const;

/**
 * 社区响应 DTO（基础）
 */
export class OutputCommunityDto extends OmitType(CommunityEntity, OMIT_FIELDS) {
  /** 当前用户是否已加入 */
  @ApiPropertyOptional({ description: '当前用户是否已加入' })
  @Expose()
  joined?: boolean;

  /** 当前用户角色（若已加入） */
  @ApiPropertyOptional({ description: '当前用户角色', enum: CommunityMemberRole })
  @Expose()
  role?: CommunityMemberRole;

  @ApiProperty({ description: '社区状态', enum: CommunityStatus })
  @Expose()
  statusText: string;
}

/**
 * 社区列表项 DTO（私密社区不返回 memberCount、assetCount）
 */
export class OutputCommunityListItemDto extends OmitType(OutputCommunityDto, ['memberCount', 'assetCount']) {
  @ApiPropertyOptional({ description: '成员数量（私密社区不返回）' })
  @Expose()
  memberCount?: number;

  @ApiPropertyOptional({ description: '资产数量（私密社区不返回）' })
  @Expose()
  assetCount?: number;
}
