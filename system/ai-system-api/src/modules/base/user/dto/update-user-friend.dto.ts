import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { FriendStatus } from '../enums';

/**
 * 更新好友关系 DTO
 */
export class UpdateUserFriendDto {
  /**
   * 好友状态（用于接受/拒绝/屏蔽好友请求）
   */
  @ApiPropertyOptional({
    description: '好友状态（用于接受/拒绝/屏蔽好友请求）',
    enum: FriendStatus,
  })
  @IsOptional()
  @IsEnum(FriendStatus)
  status?: FriendStatus;

  /**
   * 备注（用户对好友的备注名称）
   */
  @ApiPropertyOptional({ description: '备注（用户对好友的备注名称）' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;
}
