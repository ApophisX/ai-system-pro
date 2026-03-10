/**
 * 吸顶搜索头部
 */

import { View, Text, Input } from '@tarojs/components';
import { debounce } from 'es-toolkit';
import { useCallback, useMemo, useState } from 'react';
import { useAppContext } from '@/hooks/use-app';
import { useGetLocationDetail } from '@/actions/location';
import Taro from '@tarojs/taro';
import { AppLocation } from '@/model/location';

const SEARCH_DEBOUNCE_MS = 300;
const PLACEHOLDER = '搜索无人机、露营装备...';

export interface GoodsSearchHeaderProps {
  /** 防抖后的搜索回调，参数为搜索关键词 */
  onSearch?: (keyword: string) => void;
  /** 默认搜索关键词（受控时使用） */
  defaultValue?: string;
  showAddress?: boolean;
  rightExtra?: React.ReactNode;
}

export function GoodsSearchHeader({
  onSearch,
  defaultValue = '',
  showAddress = true,
  rightExtra,
}: GoodsSearchHeaderProps) {
  const [value, setValue] = useState(defaultValue);

  const { setCurrentLocation, currentLocation } = useAppContext();

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

  const emitSearch = useMemo(
    () =>
      debounce((keyword: string) => {
        onSearch?.(keyword.trim());
      }, SEARCH_DEBOUNCE_MS),
    [onSearch],
  );

  const handleInput = useCallback(
    (e: { detail: { value: string } }) => {
      const v = e.detail.value;
      setValue(v);
      emitSearch(v);
    },
    [emitSearch],
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch?.('');
  }, [onSearch]);

  return (
    <View className="sticky top-0 z-50 bg-white border-b border-gray-100 safe-area-top">
      <View className="flex items-center gap-2 px-3 py-2.5">
        {showAddress && (
          <View className="flex items-center gap-1 min-w-0" hoverClass="opacity-70" onClick={handleAddressClick}>
            <Text className="text-sm font-medium text-gray-800 truncate" style={{ maxWidth: '120px' }}>
              {currentLocation?.name || currentLocation?.getFullAddress() || '请选择地址'}
            </Text>
            <Text className="text-gray-400 text-xs">▼</Text>
          </View>
        )}
        <View className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
          <Text className="text-gray-400 text-sm shrink-0">🔍</Text>
          <Input
            className="flex-1 text-sm text-gray-800 bg-transparent min-w-0"
            placeholder={PLACEHOLDER}
            placeholderClass="text-gray-400"
            value={value}
            onInput={handleInput}
            confirmType="search"
            onConfirm={e => onSearch?.(e.detail.value.trim())}
          />
          {value ? (
            <View onClick={handleClear} hoverClass="opacity-70" className="shrink-0">
              <Text className="text-gray-400 text-sm">清除</Text>
            </View>
          ) : null}
        </View>
        {rightExtra && <View className="shrink-0">{rightExtra}</View>}
      </View>
    </View>
  );
}
