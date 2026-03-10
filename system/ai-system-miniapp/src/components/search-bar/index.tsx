/**
 * 吸顶搜索头部
 */

import { View, Text, Input } from '@tarojs/components';
import { debounce } from 'es-toolkit';
import { useCallback, useMemo, useState } from 'react';

const SEARCH_DEBOUNCE_MS = 300;

export interface SearchBarProps {
  /** 防抖后的搜索回调，参数为搜索关键词 */
  onSearch?: (keyword: string) => void;
  /** 默认搜索关键词（受控时使用） */
  defaultValue?: string;
  /** 搜索框占位文案 */
  placeholder?: string;
  extra?: React.ReactNode;
  className?: string;
}

const DEFAULT_PLACEHOLDER = '搜索...';

export function SearchBar({
  onSearch,
  defaultValue = '',
  placeholder = DEFAULT_PLACEHOLDER,
  extra,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

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
      <View className={`flex items-center gap-2 px-3 py-2.5 ${className}`}>
        <View className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
          <Text className="text-gray-400 text-sm shrink-0">🔍</Text>
          <Input
            className="flex-1 text-sm text-gray-800 bg-transparent min-w-0"
            placeholder={placeholder}
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
        {extra}
      </View>
    </View>
  );
}
