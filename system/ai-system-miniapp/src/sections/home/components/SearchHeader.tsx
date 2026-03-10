/**
 * 吸顶搜索头部
 */

import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { paths } from '@/route/paths';
import { useGetLocationDetail } from '@/actions/location';
import { useAppContext } from '@/hooks/use-app';
import { AppLocation } from '@/model/location';
import MyIcon from '@/components/my-icon';

export function SearchHeader() {
  const { setCurrentLocation, currentLocation } = useAppContext();

  const handleSearchClick = () => {
    Taro.navigateTo({ url: paths.goods.list });
  };

  const { getLocation } = useGetLocationDetail();

  const handleAddressClick = () => {
    Taro.chooseLocation({
      title: '选择地址',
      longitude: currentLocation?.longitude,
      latitude: currentLocation?.latitude,
      success: async result => {
        const { longitude, latitude } = result;
        const res = await getLocation({ longitude, latitude });
        Taro.setStorage({ key: 'currentLocation', data: res });
        setCurrentLocation(new AppLocation(res));
      },
    });
  };

  return (
    <View className="sticky top-0 z-50 bg-white border-b border-gray-100 safe-area-top">
      <View className="flex items-center gap-2 px-3 py-2.5">
        <View className="flex items-center gap-1 min-w-0" hoverClass="opacity-70" onClick={handleAddressClick}>
          <Text className="text-sm font-medium text-gray-800 truncate" style={{ maxWidth: '120px' }}>
            {currentLocation?.name || currentLocation?.getFullAddress()}
          </Text>
          <Text className="text-gray-400 text-xs">▼</Text>
        </View>
        <View
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
          hoverClass="opacity-80"
          onClick={handleSearchClick}
        >
          <Text className="text-gray-400 text-sm">🔍</Text>
          <Text className="text-gray-500 text-sm flex-1 truncate">搜索无人机、露营装备...</Text>
        </View>
        <View
          className="flex flex-col items-center justify-center px-1"
          onClick={() => {
            Taro.scanCode({
              success: result => {
                Taro.navigateTo({ url: paths.webview(`${APP_URL}${result.result}`) });
                console.log(result);
              },
            });
          }}
        >
          <MyIcon name="IconScanInventory" size={28} />
        </View>
      </View>
    </View>
  );
}
