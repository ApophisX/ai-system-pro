import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { BASE_ENTITY_OMIT_FIELDS } from '@/infrastructure/database';

/**
 * 用户资料输出 DTO
 */
export class OutputUserProfileDto extends OmitType(UserProfileEntity, [
  'idCard',
  'idCardPhotoUrls',
  ...BASE_ENTITY_OMIT_FIELDS,
] as const) {
  @ApiProperty({ description: '身份证号' })
  @Expose()
  @Transform(({ value }) => {
    return value ? value.replace(/^(.{3}).*(.{4})$/, '$1******$2') : value;
  })
  idCard: string;
}

/**
 * 用户详情资料输出 DTO
 */
export class OutputUserDetailProfileDto extends OmitType(UserProfileEntity, [
  'idCard',
  ...BASE_ENTITY_OMIT_FIELDS,
] as const) {
  @ApiProperty({ description: '身份证号' })
  @Expose()
  @Transform(({ value }) => {
    return value ? value.replace(/^(.{3}).*(.{4})$/, '$1******$2') : value;
  })
  idCard: string;
}

/**
 * 简单的用户资料信息输出 DTO
 */
export class OutputUserProfileBriefDto extends PickType(UserProfileEntity, ['id', 'nickname', 'gender'] as const) {}

//-----------------------------------------------------------------------

/**
 * 用户简要信息输出 DTO（用于列表展示或关联展示）
 */
export class OutputUserBriefDto extends PickType(UserEntity, [
  'id',
  'username',
  'userType',
  'isVerified',
  'isEnterpriseVerified',
  'creditScore',
  'avatar',
]) {
  @ApiProperty({ description: '是否实名认证' })
  @Expose()
  isVerified: boolean;

  @ApiProperty({ description: '是否企业认证' })
  @Expose()
  isEnterpriseVerified: boolean;

  @ApiProperty({ description: '用户资料' })
  @Expose()
  @Type(() => OutputUserProfileBriefDto)
  profile: OutputUserProfileBriefDto;
}

/**
 * 用户基础信息输出 DTO（App 端用户中心）
 */
export class OutputUserDto extends OmitType(UserEntity, ['profile', 'password']) {
  @ApiProperty({
    description: '用户资料',
    type: OutputUserProfileDto,
  })
  @Expose()
  @Type(() => OutputUserProfileDto)
  profile: OutputUserProfileDto;

  @ApiProperty({ description: '是否实名认证' })
  @Expose()
  isVerified: boolean;

  @ApiProperty({ description: '是否企业认证' })
  @Expose()
  isEnterpriseVerified: boolean;
}

/**
 * 用户详情输出 DTO（包含资料信息）
 */
export class OutputUserDetailDto extends OmitType(OutputUserDto, ['profile'] as const) {
  //
  @ApiProperty({
    description: '用户资料',
    type: OutputUserDetailProfileDto,
  })
  @Expose()
  @Type(() => OutputUserDetailProfileDto)
  profile: OutputUserDetailProfileDto;
}

/**
 * 用户公开信息输出 DTO（出租方/承租方对外展示）
 */
export class OutputUserPublicDto extends OmitType(OutputUserDto, ['createdAt', 'updatedAt'] as const) {}

/**
 * 出租方可查看的承租方信息输出的DTO
 */
export class OutputUserForLessorDto extends OmitType(OutputUserDto, ['createdAt', 'updatedAt'] as const) {}

/**
 * 用户列表项输出 DTO（管理端用）
 */
export class OutputUserListItemDto extends OmitType(UserEntity, ['profile']) {}

/**
 * 管理端用户列表项简要资料 DTO
 */
export class OutputAdminUserProfileBriefDto extends PickType(UserProfileEntity, [
  'nickname',
  'companyName',
  'legalRepresentative',
] as const) {}

/**
 * 管理端用户列表项输出 DTO（含简要资料）
 */
export class OutputAdminUserListItemDto extends OutputUserListItemDto {
  @ApiProperty({
    description: '用户资料简要信息',
    type: OutputAdminUserProfileBriefDto,
    required: false,
  })
  @Expose()
  @Type(() => OutputAdminUserProfileBriefDto)
  profile?: OutputAdminUserProfileBriefDto;
}

/**
 * 企业认证资料简要 DTO（管理端企业申请列表用）
 */
export class OutputUserProfileEnterpriseBriefDto extends OmitType(UserProfileEntity, [] as const) {}

/**
 * 企业用户申请列表项输出 DTO（管理端分页列表）
 */
export class OutputEnterpriseApplicationListItemDto extends PickType(UserEntity, [
  'id',
  'username',
  'phone',
  'email',
  'userType',
  'enterpriseVerificationStatus',
  'enterpriseVerifiedAt',
  'status',
  'createdAt',
] as const) {
  @ApiProperty({
    description: '企业资料简要信息',
    type: OutputUserProfileEnterpriseBriefDto,
  })
  @Expose()
  @Type(() => OutputUserProfileEnterpriseBriefDto)
  profile?: OutputUserProfileEnterpriseBriefDto;
}

export class OutputUserInfoDto extends PickType(UserEntity, [
  'id',
  'username',
  'phone',
  'email',
  'userType',
  'verificationStatus',
  'enterpriseVerificationStatus',
  'creditScore',
  'status',
] as const) {
  @ApiProperty({ description: '是否已完成认证（个人实名或企业认证通过）' })
  @Expose()
  isVerified: boolean;

  @ApiProperty({ description: '是否企业认证' })
  @Expose()
  isEnterpriseVerified: boolean;
}
