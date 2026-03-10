/**
 * 平台环境检测工具
 * 用于判断当前运行环境是否在微信小程序、支付宝小程序等
 */

/**
 * 运行平台类型
 */
export enum PlatformType {
  /** 浏览器环境 */
  BROWSER = 'browser',
  /** 微信小程序 */
  WECHAT_MINI_PROGRAM = 'wechat_mini_program',
  /** 支付宝小程序 */
  ALIPAY_MINI_PROGRAM = 'alipay_mini_program',
  /** 字节跳动小程序 */
  BYTEDANCE_MINI_PROGRAM = 'bytedance_mini_program',
  /** 百度小程序 */
  BAIDU_MINI_PROGRAM = 'baidu_mini_program',
  /** QQ小程序 */
  QQ_MINI_PROGRAM = 'qq_mini_program',
  /** 微信H5 */
  WECHAT_H5 = 'wechat_h5',
  /** 支付宝H5 */
  ALIPAY_H5 = 'alipay_h5',
  /** 未知平台 */
  UNKNOWN = 'unknown',
}

/**
 * 判断是否在微信小程序环境
 */
export function isWeChatMiniProgram(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 方法1: 检查 wx 对象和 getSystemInfoSync
  if (
    typeof (window as any).wx !== 'undefined' &&
    typeof (window as any).wx.getSystemInfoSync === 'function'
  ) {
    return true;
  }

  // 方法2: 检查 __wxjs_environment
  if ((window as any).__wxjs_environment === 'miniprogram') {
    return true;
  }

  // 方法3: 检查 userAgent
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('miniprogram') && ua.includes('micromessenger')) {
    return true;
  }

  return false;
}

/**
 * 判断是否在支付宝小程序环境
 */
export function isAlipayMiniProgram(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 方法1: 检查 my 对象
  if (
    typeof (window as any).my !== 'undefined' &&
    typeof (window as any).my.getSystemInfo === 'function'
  ) {
    return true;
  }

  // 方法2: 检查 userAgent
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('miniprogram') && ua.includes('alipayclient')) {
    return true;
  }

  return false;
}

/**
 * 判断是否在字节跳动小程序环境
 */
export function isByteDanceMiniProgram(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 检查 tt 对象
  if (
    typeof (window as any).tt !== 'undefined' &&
    typeof (window as any).tt.getSystemInfo === 'function'
  ) {
    return true;
  }

  // 检查 userAgent
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('miniprogram') && ua.includes('toutiao')) {
    return true;
  }

  return false;
}

/**
 * 判断是否在百度小程序环境
 */
export function isBaiduMiniProgram(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 检查 swan 对象
  if (
    typeof (window as any).swan !== 'undefined' &&
    typeof (window as any).swan.getSystemInfo === 'function'
  ) {
    return true;
  }

  // 检查 userAgent
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('miniprogram') && ua.includes('swan')) {
    return true;
  }

  return false;
}

/**
 * 判断是否在QQ小程序环境
 */
export function isQQMiniProgram(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 检查 qq 对象
  if (
    typeof (window as any).qq !== 'undefined' &&
    typeof (window as any).qq.getSystemInfo === 'function'
  ) {
    return true;
  }

  // 检查 userAgent
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('miniprogram') && ua.includes('qq')) {
    return true;
  }

  return false;
}

/**
 * 判断是否在微信H5环境
 */
export function isWeChatH5(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger') && !isWeChatMiniProgram();
}

/**
 * 判断是否在支付宝H5环境
 */
export function isAlipayH5(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('alipayclient') && !isAlipayMiniProgram();
}

/**
 * 判断是否在小程序环境（任意小程序平台）
 */
export function isMiniProgram(): boolean {
  return (
    isWeChatMiniProgram() ||
    isAlipayMiniProgram() ||
    isByteDanceMiniProgram() ||
    isBaiduMiniProgram() ||
    isQQMiniProgram()
  );
}

/**
 * 判断是否在浏览器环境
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && !isMiniProgram();
}

/**
 * 获取当前运行平台类型
 */
export function getPlatformType(): PlatformType {
  if (isWeChatMiniProgram()) {
    return PlatformType.WECHAT_MINI_PROGRAM;
  }
  if (isAlipayMiniProgram()) {
    return PlatformType.ALIPAY_MINI_PROGRAM;
  }
  if (isByteDanceMiniProgram()) {
    return PlatformType.BYTEDANCE_MINI_PROGRAM;
  }
  if (isBaiduMiniProgram()) {
    return PlatformType.BAIDU_MINI_PROGRAM;
  }
  if (isQQMiniProgram()) {
    return PlatformType.QQ_MINI_PROGRAM;
  }
  if (isWeChatH5()) {
    return PlatformType.WECHAT_H5;
  }
  if (isAlipayH5()) {
    return PlatformType.ALIPAY_H5;
  }
  if (isBrowser()) {
    return PlatformType.BROWSER;
  }
  return PlatformType.UNKNOWN;
}

/**
 * 平台检测器类
 * 提供统一的平台检测接口
 */
export class PlatformDetector {
  /**
   * 当前平台类型（缓存）
   */
  private static cachedPlatformType: PlatformType | null = null;

  /**
   * 获取当前平台类型（带缓存）
   */
  static getPlatformType(): PlatformType {
    if (this.cachedPlatformType === null) {
      this.cachedPlatformType = getPlatformType();
    }
    return this.cachedPlatformType;
  }

  /**
   * 判断是否在微信小程序
   */
  static isWeChatMiniProgram(): boolean {
    return isWeChatMiniProgram();
  }

  /**
   * 判断是否在支付宝小程序
   */
  static isAlipayMiniProgram(): boolean {
    return isAlipayMiniProgram();
  }

  /**
   * 判断是否在字节跳动小程序
   */
  static isByteDanceMiniProgram(): boolean {
    return isByteDanceMiniProgram();
  }

  /**
   * 判断是否在百度小程序
   */
  static isBaiduMiniProgram(): boolean {
    return isBaiduMiniProgram();
  }

  /**
   * 判断是否在QQ小程序
   */
  static isQQMiniProgram(): boolean {
    return isQQMiniProgram();
  }

  /**
   * 判断是否在微信H5
   */
  static isWeChatH5(): boolean {
    return isWeChatH5();
  }

  /**
   * 判断是否在支付宝H5
   */
  static isAlipayH5(): boolean {
    return isAlipayH5();
  }

  /**
   * 判断是否在小程序环境（任意平台）
   */
  static isMiniProgram(): boolean {
    return isMiniProgram();
  }

  /**
   * 判断是否在浏览器环境
   */
  static isBrowser(): boolean {
    return isBrowser();
  }

  /**
   * 清除平台类型缓存（用于需要重新检测的场景）
   */
  static clearCache(): void {
    this.cachedPlatformType = null;
  }
}
