import type { InputBaseProps, StackProps } from '@mui/material';

import { debounce } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';
import { useRef, useMemo, useCallback, useState } from 'react';

import { InputBase, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { HorizontalStack } from '../layout';

type Props = {
  defaultValue?: string;
  onChange?: (value: string) => void;
  showBorder?: boolean;
  slotProps?: {
    input?: InputBaseProps;
    root?: StackProps;
  };
};
export function Searchbar({
  defaultValue = '',
  onChange = () => {},
  showBorder = false,
  slotProps,
}: Props) {
  const [searchValue, setSearchValue] = useState(defaultValue);

  // 标记是否正在输入中文（组合输入状态）
  const isComposingRef = useRef(false);
  // 输入框的引用
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isFocus = useBoolean(false);

  // 处理中文输入法开始
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  // 处理中文输入法结束
  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;

    const handleChange = debounce((value: string) => {
      if (isComposingRef.current) return;
      onChange?.(value);
    }, 1000);

    // 使用 setTimeout 确保在 onChange 事件处理完成后再更新 URL
    // 从 inputRef 获取最新的值
    setTimeout(() => {
      if (inputRef.current) {
        handleChange?.(inputRef.current.value);
      }
    }, 0);
  }, [onChange]);

  const debouncedOnChange = useMemo(
    () =>
      debounce((v: string) => {
        if (isComposingRef.current) return;
        onChange?.(v);
      }, 1000),
    [onChange]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
      debouncedOnChange(event.target.value.trim());
    },
    [debouncedOnChange]
  );

  return (
    <HorizontalStack
      sx={{
        flex: 1,
        pl: 1.5,
        pr: 1,
        // py: 0.5,
        borderRadius: 1,
        border: showBorder ? (theme) => `solid 1px ${theme.vars.palette.divider}` : 'none',
        backgroundColor: (theme) => theme.vars.palette.AppBar.defaultBg,
        ...slotProps?.root?.sx,
      }}
      spacing={1}
    >
      <Iconify icon="eva:search-fill" width={18} sx={{ color: 'text.disabled' }} />
      <InputBase
        placeholder="请输入关键字进行搜索..."
        fullWidth
        value={searchValue}
        size="medium"
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onFocus={isFocus.onTrue}
        inputRef={inputRef}
        {...slotProps?.input}
      />
      {searchValue && isFocus.value && (
        <IconButton
          sx={{ width: 24, height: 24 }}
          onClick={() => {
            setSearchValue('');
            onChange?.('');
            setTimeout(() => {
              inputRef.current?.focus();
            }, 300);
          }}
        >
          <Iconify icon="solar:close-circle-bold" sx={{ width: 18, height: 18 }} />
        </IconButton>
      )}
    </HorizontalStack>
  );
}
