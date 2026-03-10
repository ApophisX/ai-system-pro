/**
 * 品类入口网格
 */

import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { useGetAssetCategories } from '@/actions/assets';
import { paths } from '@/route/paths';

export function CategoryGrid() {
  const { data: categories } = useGetAssetCategories({ displayOnHome: true });

  const handleCategoryClick = (code: string) => {
    Taro.navigateTo({
      url: `${paths.goods.list}?category=${code}`,
    });
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <View className="grid grid-cols-4 gap-3 p-4">
      {categories.map(item => (
        <View
          key={item.code}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm"
          hoverClass="opacity-80"
          hoverStayTime={100}
          onClick={() => handleCategoryClick(item.code)}
        >
          <Text className="text-2xl mb-2">{item.icon || '📦'}</Text>
          <Text className="text-xs font-semibold text-gray-800">{item.name || '其他'}</Text>
        </View>
      ))}

      <View
        className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm"
        hoverClass="opacity-80"
        hoverStayTime={100}
        onClick={() => handleCategoryClick('all')}
      >
        <Text className="text-2xl mb-2">🔍</Text>
        <Text className="text-xs font-semibold text-gray-800">其他</Text>
      </View>
    </View>
  );
}
