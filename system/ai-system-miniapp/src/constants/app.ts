import { ILocation } from '@/model/location';

export const DEFAULT_LOCATION: ILocation = {
  province: '北京市',
  provinceCode: '110000',
  city: '北京市',
  cityCode: '110100',
  district: '东城区',
  districtCode: '110101',
  address: '长安街北侧',
  name: '天安门',
  longitude: 116.397455,
  latitude: 39.909187,
};

export const AXIOS_HEADER_TENANT_KEY = 'x-tenant-id';

export const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';

export const PAYMENT_RESULT_STORAGE_KEY = 'payment_result';

export const SOURCE_PAGE_KEY = 'source_page_key';

export const PAGE_PARAMS_KEY = 'page_params_key';

// 替换为你的 Logo 和背景图
export const SYSTEM_IMAGES = {
  logo: 'https://cdn-icons-png.flaticon.com/512/236/236832.png', // 这是一个代表"租赁"的图标
  bgDeco: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80', // 柔和背景
};
