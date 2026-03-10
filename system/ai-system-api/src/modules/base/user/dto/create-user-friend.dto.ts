import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * 创建好友请求 DTO（发送好友请求）
 */
export class CreateUserFriendDto {
  /**
   * 好友 ID（要添加的用户 ID）
   */
  @ApiProperty({ description: '好友 ID（要添加的用户 ID）' })
  @IsNotEmpty()
  @IsUUID()
  friendId: string;

  /**
   * 备注（可选，用户对好友的备注名称）
   */
  @ApiPropertyOptional({ description: '备注（可选，用户对好友的备注名称）' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;
}
