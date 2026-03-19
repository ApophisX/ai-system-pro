import type { PaletteColorKey } from 'src/theme';
/**
 * 登录类型枚举
 */
export enum AuthLoginType {
  /**
   * 密码登录
   */
  PASSWORD = 1,

  /**
   * 短信登录
   */
  SMS = 2,
}

/**
 * 短信场景枚举
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

export const AXIOS_HEADER_TENANT_KEY = 'x-tenant-id';

export const TENANT_STORAGE_KEY = 'tenant_id';

export const ACCESS_TOKEN_STORAGE_KEY = 'jwt_access_token';

export const REFRESH_TOKEN_STORAGE_KEY = 'jwt_refresh_token';

export const DEFAULT_STORE_ID = 'default_store_id';

export enum MenuType {
  category = 'category',
  page = 'page',
  button = 'button',
}

export const MenuTypeMap = {
  [MenuType.category]: '目录',
  [MenuType.page]: '页面',
  [MenuType.button]: '按钮',
};

/** ================================ 字典内容  ================================*/

export const UploadMaxSize = {
  image: 5 * 1024 * 1024,
};

export const DEFAULT_LOCATION = {
  province: { label: '上海市', value: '310000' },
  city: { label: '上海市', value: '310100' },
  district: null,
  latitude: 31.2304,
  longitude: 121.4737,
};
