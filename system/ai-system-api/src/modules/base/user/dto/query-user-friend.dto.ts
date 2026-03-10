import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { FriendStatus } from '../enums';

/**
 * 好友列表查询 DTO
 */
export class QueryUserFriendDto extends PaginationQueryDto {
  /**
   * 好友状态过滤（pending/accepted/blocked）
   */
  @ApiPropertyOptional({
    description: '好友状态过滤（pending/accepted/blocked）',
    enum: FriendStatus,
  })
  @IsOptional()
  @IsEnum(FriendStatus)
  status?: FriendStatus;

  /**
   * 关键字搜索（搜索好友的用户名或备注）
   */
  @ApiPropertyOptional({ description: '关键字搜索（搜索好友的用户名或备注）' })
  @IsOptional()
  keyword?: string;
}
