/**
 * SMS 验证码场景枚举
 */

export enum SmsScene {
  /** 注册 */
  REGISTER = 'register',
  /** 找回密码 */
  RESET_PASSWORD = 'reset_password',
  /** 修改密码 */
  CHANGE_PASSWORD = 'change_password',
  /** 登录 */
  LOGIN = 'login',
}
