import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantInviteCodeEntity, MerchantInviteRelationEntity, MerchantInviteRewardEntity } from '../entities';
import { OmitType } from '@nestjs/swagger';

/** 邀请码输出 */
export class OutputMerchantInviteCodeDto extends OmitType(MerchantInviteCodeEntity, [
  'deletedAt',
  'version',
] as const) {}

/** 邀请关系输出 */
export class OutputMerchantInviteRelationDto extends OmitType(MerchantInviteRelationEntity, [
  'deletedAt',
  'version',
] as const) {}

/** 奖励记录输出 */
export class OutputMerchantInviteRewardDto extends OmitType(MerchantInviteRewardEntity, [
  'deletedAt',
  'version',
] as const) {}

/** 员工我的邀请码与统计 */
export class OutputMyInviteCodeDto {
  @ApiProperty({ description: '邀请码' })
  inviteCode: string;

  @ApiPropertyOptional({ description: '过期时间' })
  expireAt?: Date;

  @ApiProperty({ description: '已邀请商户数' })
  invitedCount: number;

  @ApiProperty({ description: '已认证数' })
  verifiedCount: number;

  @ApiProperty({ description: '已上架数' })
  listedCount: number;

  @ApiProperty({ description: '首单完成数' })
  firstOrderCount: number;

  @ApiProperty({ description: '本月已发放分润（元）' })
  monthlyReleasedRebate: number;

  @ApiProperty({ description: '月度封顶（元）' })
  monthlyCap: number;
}

/** 排行榜项 */
export class OutputInviteRankItemDto {
  @ApiProperty({ description: '员工 ID' })
  employeeId: string;

  @ApiProperty({ description: '员工昵称/用户名' })
  employeeName: string;

  @ApiProperty({ description: '邀请商户总数' })
  invitedCount: number;

  @ApiProperty({ description: '首单完成数' })
  firstOrderCount: number;

  @ApiProperty({ description: '已发放分润总额（元）' })
  totalReleasedRebate: number;

  @ApiProperty({ description: '排名' })
  rank: number;
}
