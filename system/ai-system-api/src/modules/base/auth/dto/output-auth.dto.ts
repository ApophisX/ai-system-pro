import { ApiProperty } from '@nestjs/swagger';
import { UserType, VerificationStatus, AccountStatus } from '../../user/enums';
import { Expose, Type } from 'class-transformer';
import { OutputUserInfoDto } from '../../user/dto/output-user.dto';

/**
 * 认证令牌输出 DTO
 */
export class AuthTokenOutput {
  @Expose()
  @ApiProperty({
    description: '访问令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @Expose()
  @ApiProperty({
    description: '刷新令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

/**
 * 认证响应 DTO
 */
export class OutputAuthDto extends AuthTokenOutput {
  @ApiProperty({ description: '用户信息' })
  @Expose()
  @Type(() => OutputUserInfoDto)
  user: OutputUserInfoDto;
}

/**
 * 用户刷新令牌声明 DTO
 */
export class UserRefreshTokenClaims extends OutputUserInfoDto {
  @Expose()
  @ApiProperty()
  id: string;
}
/**
 * 用户访问令牌声明 DTO
 */
export class UserAccessTokenClaims extends UserRefreshTokenClaims {
  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiProperty()
  isAdmin: boolean = false;
}
