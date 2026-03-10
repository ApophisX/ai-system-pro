/**
 * 首页相关常量与模拟数据
 */

import type { AssetItem, CategoryItem } from './types';

export const PATHS = {
  goodsList: '/rental/goods',
  goodsDetail: (id: string) => `/rental/goods/${id}`,
  addressSelect: '/address/select',
};

export const MOCK_CATEGORIES: CategoryItem[] = [
  { id: '1', code: 'ebike', name: '电动车', icon: '🛵', sortOrder: 1, displayOnHome: true },
  { id: '2', code: 'tools', name: '工具设备', icon: '🛠️', sortOrder: 2, displayOnHome: true },
  { id: '3', code: 'camera', name: '摄影器材', icon: '📷', sortOrder: 3, displayOnHome: true },
  { id: '4', code: 'outdoor', name: '户外用品', icon: '⛺', sortOrder: 4, displayOnHome: true },
  { id: '5', code: 'office', name: '临时办公', icon: '💻', sortOrder: 5, displayOnHome: true },
  { id: '6', code: 'drone', name: '无人机', icon: '🚁', sortOrder: 6, displayOnHome: true },
];

export const MOCK_ASSETS: AssetItem[] = [
  {
    id: 'a1',
    name: '大疆 Mavic 3 专业版无人机 4K航拍',
    coverImage: 'https://picsum.photos/400/300?random=1',
    deposit: 0,
    rating: 4.9,
    viewCount: 1280,
    customTags: ['免押', '同城配送', '日租'],
    rentalPlans: [{ price: 299, rentalType: 'daily' }],
    owner: { avatar: 'https://picsum.photos/64?random=u1', isVerified: true },
    contact: { city: '杭州市', district: '西湖区' },
    isFavorite: false,
  },
  {
    id: 'a2',
    name: '索尼 A7M4 全画幅微单相机 配24-70镜头',
    coverImage: 'https://picsum.photos/400/300?random=2',
    deposit: 500,
    rating: 4.8,
    viewCount: 856,
    customTags: ['专业', '上门自提'],
    rentalPlans: [{ price: 199, rentalType: 'daily' }],
    owner: { avatar: 'https://picsum.photos/64?random=u2', isVerified: false },
    contact: { city: '上海市', district: '浦东新区' },
    isFavorite: true,
  },
  {
    id: 'a3',
    name: '雅马哈电动车 续航80km 可上牌',
    coverImage: 'https://picsum.photos/400/300?random=3',
    deposit: 0,
    rating: 4.7,
    viewCount: 632,
    customTags: ['免押', '信用免押'],
    rentalPlans: [{ price: 49, rentalType: 'daily' }],
    owner: { avatar: 'https://picsum.photos/64?random=u3', isVerified: true },
    contact: { city: '杭州市', district: '余杭区' },
    isFavorite: false,
  },
  {
    id: 'a4',
    name: '牧高笛 4人帐篷 户外露营',
    coverImage: 'https://picsum.photos/400/300?random=4',
    deposit: 200,
    rating: 4.6,
    viewCount: 421,
    customTags: ['户外', '露营'],
    rentalPlans: [{ price: 79, rentalType: 'daily' }],
    owner: { avatar: 'https://picsum.photos/64?random=u4', isVerified: true },
    contact: { city: '南京市', district: '玄武区' },
    isFavorite: false,
  },
  {
    id: 'a5',
    name: 'MacBook Pro 14寸 M3芯片 办公学习',
    coverImage: 'https://picsum.photos/400/300?random=5',
    deposit: 1000,
    rating: 5.0,
    viewCount: 2103,
    customTags: ['高端', '同城配送'],
    rentalPlans: [{ price: 99, rentalType: 'daily' }],
    owner: { avatar: 'https://picsum.photos/64?random=u5', isVerified: true },
    contact: { city: '北京市', district: '朝阳区' },
    isFavorite: false,
  },
  {
    id: 'a6',
    name: '博世电钻套装 家用装修工具',
    coverImage: 'https://picsum.photos/400/300?random=6',
    deposit: 0,
    rating: 4.5,
    viewCount: 312,
    customTags: ['工具', '免押'],
    rentalPlans: [{ price: 29, rentalType: 'daily' }],
    owner: { avatar: 'https://picsum.photos/64?random=u6', isVerified: false },
    contact: { city: '广州市', district: '天河区' },
    isFavorite: false,
  },
];

export const defaultArea = {
  province: { value: '33', label: '浙江省' },
  city: { value: '3301', label: '杭州市' },
  district: { value: '330106', label: '西湖区' },
};
