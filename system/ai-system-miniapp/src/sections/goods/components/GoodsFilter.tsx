/**
 * Taro 商品筛选组件 - 分类 + 排序
 * 使用 TailwindCSS 实现样式
 * 使用 MyApi 接口定义，不实现实际请求
 */

import { useGetAssetCategories } from '@/actions/assets';
import { View, Text, ScrollView } from '@tarojs/components';

// ----------------------------------------------------------------------
// 类型定义
// ----------------------------------------------------------------------

export type AssetSortBy = NonNullable<MyApi.AppAssetControllerGetAssetListV1Params['sortBy']>;

export interface GoodsFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy?: AssetSortBy;
  onSortChange: (sort: AssetSortBy) => void;
}

// ----------------------------------------------------------------------
// MOCK 分类数据（符合 AppOutputAssetCategoryDto）
// ----------------------------------------------------------------------

const MOCK_CATEGORIES: MyApi.AppOutputAssetCategoryDto[] = [
  { id: '1', code: 'ebike', name: '电动车', icon: '🛵', sortOrder: 1, displayOnHome: true },
  { id: '2', code: 'tools', name: '工具设备', icon: '🛠️', sortOrder: 2, displayOnHome: true },
  { id: '3', code: 'camera', name: '摄影器材', icon: '📷', sortOrder: 3, displayOnHome: true },
  { id: '4', code: 'outdoor', name: '户外用品', icon: '⛺', sortOrder: 4, displayOnHome: true },
  { id: '5', code: 'office', name: '临时办公', icon: '💻', sortOrder: 5, displayOnHome: true },
  { id: '6', code: 'drone', name: '无人机', icon: '🚁', sortOrder: 6, displayOnHome: true },
];

// ----------------------------------------------------------------------
// 排序选项
// ----------------------------------------------------------------------

const SORT_OPTIONS: { id: AssetSortBy; label: string; icon: string }[] = [
  { id: 'recommend', label: '推荐', icon: '🔥' },
  { id: 'nearby', label: '附近', icon: '📍' },
  { id: 'newest', label: '最新', icon: '🕐' },
  { id: 'price', label: '价格', icon: '↕️' },
];

// ----------------------------------------------------------------------
// 分类项
// ----------------------------------------------------------------------

function CategoryItem({
  data,
  icon,
  onClick,
  isActive,
}: {
  data: { id: string; name: string };
  icon: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <View
      className={`flex-shrink-0 flex flex-row items-center gap-1 px-4 py-2 rounded-2xl ${
        isActive ? 'bg-blue-500' : 'bg-gray-100'
      }`}
      hoverClass="opacity-90"
      onClick={onClick}
    >
      <Text className="text-base">{icon}</Text>
      <Text className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-600'}`}>
        {data.name}
      </Text>
    </View>
  );
}

// ----------------------------------------------------------------------
// 主组件
// ----------------------------------------------------------------------

export function GoodsFilter(props: GoodsFilterProps) {
  const { activeCategory, onCategoryChange, sortBy, onSortChange } = props;
  const { data: categories } = useGetAssetCategories({ displayOnHome: true });

  return (
    <View className="sticky top-0 z-[100] bg-white border-b border-gray-100">
      {/* 分类横向滚动 */}
      <ScrollView scrollX enhanced showScrollbar={false} scrollWithAnimation={false}>
        <View className="flex flex-row gap-2 px-4 py-3">
          <CategoryItem
            data={{ id: 'all', name: '全部' }}
            icon="✨"
            onClick={() => onCategoryChange('all')}
            isActive={activeCategory === 'all' || !activeCategory}
          />
          {categories.map(cat => {
            const isActive = activeCategory === cat.code;
            return (
              <CategoryItem
                key={cat.id}
                data={{ id: cat.id, name: cat.name || '' }}
                icon={cat.icon || '📦'}
                onClick={() => onCategoryChange(cat.code)}
                isActive={isActive}
              />
            );
          })}
          <View style={{ width: '100px' }}>&nbsp;&nbsp;&nbsp;&nbsp;</View>
        </View>
      </ScrollView>

      {/* 排序栏 */}
      <View className="flex flex-row gap-4 px-4 pb-3">
        {SORT_OPTIONS.map(option => {
          const isActive = sortBy === option.id;
          return (
            <View
              key={option.id}
              className="flex flex-row items-center gap-1"
              hoverClass="opacity-80"
              onClick={() => onSortChange(option.id)}
            >
              <Text className="text-sm">{option.icon}</Text>
              <Text className={`text-xs ${isActive ? 'text-blue-500 font-bold' : 'text-gray-500 font-medium'}`}>
                {option.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
