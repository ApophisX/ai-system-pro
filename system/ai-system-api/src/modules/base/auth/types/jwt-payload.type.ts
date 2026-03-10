import { UserType } from '../../user/enums';

/**
 * JWT 载荷类型
 */
export interface JwtPayload {
  /**
   * 用户 ID（subject）
   */
  sub: string;

  /**
   * 手机号
   */
  phone?: string;

  /**
   * 邮箱
   */
  email?: string;

  /**
   * 用户类型
   */
  userType: UserType;

  /**
   * 签发时间（iat）
   */
  iat?: number;

  /**
   * 过期时间（exp）
   */
  exp?: number;
}
