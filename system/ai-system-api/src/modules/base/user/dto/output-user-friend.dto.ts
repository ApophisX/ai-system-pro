import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserFriendEntity } from '../entities/user-friend.entity';
import { OutputUserBriefDto } from './output-user.dto';
import { OmitType } from '@nestjs/swagger';

/**
 * 好友关系输出 DTO（包含好友用户信息）
 */
export class OutputUserFriendDto extends OmitType(UserFriendEntity, ['user', 'friend'] as const) {
  /**
   * 好友用户信息
   */
  @ApiPropertyOptional({
    description: '好友用户信息',
    type: OutputUserBriefDto,
  })
  @Expose()
  @Type(() => OutputUserBriefDto)
  friend?: OutputUserBriefDto;

  /**
   * 当前用户信息（在双向查询时使用）
   */
  @ApiPropertyOptional({
    description: '当前用户信息（在双向查询时使用）',
    type: OutputUserBriefDto,
  })
  @Expose()
  @Type(() => OutputUserBriefDto)
  user?: OutputUserBriefDto;
}
