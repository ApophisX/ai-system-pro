import { m } from 'framer-motion';
import { debounce } from 'es-toolkit';
import { ArrowLeft } from 'lucide-react';
import { useBoolean } from 'minimal-shared/hooks';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useRef, useState, useEffect, useCallback } from 'react';

import { Search } from '@mui/icons-material';
import { Paper, Stack, AppBar, Toolbar, InputBase, Typography, IconButton } from '@mui/material';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useGetCurrentArea } from 'src/layouts/global/hooks/use-area';

import { Iconify } from 'src/components/iconify';
import { AddressSelectDrawer } from 'src/components/custom';
import { HorizontalStack } from 'src/components/custom/layout';

type Props = {
  onBack?: () => void;
  showBackButton?: boolean;
  onSearchClick?: () => void;
  extra?: React.ReactNode;
  showAreaSelector?: boolean;
  onKeywordChange?: (keyword: string) => void;
};

export const SearchHeader = (props: Props) => {
  const router = useRouter();
  const {
    onBack = router.back,
    showBackButton = false,
    onSearchClick,
    extra,
    showAreaSelector = true,
    onKeywordChange,
  } = props;

  const dialogs = useDialogs();

  const { currentArea, setCurrentArea } = useGetCurrentArea();

  const searchParams = useSearchParams();

  const isFocus = useBoolean(false);

  // 从 URL 参数中获取 keyword
  const keywordsFromUrl = searchParams.get('keyword') || '';
  const autoFocus = searchParams.get('autoFocus') || '';
  // 输入框的值
  const [searchValue, setSearchValue] = useState(keywordsFromUrl);

  // 标记是否正在输入中文（组合输入状态）
  const isComposingRef = useRef(false);
  // 输入框的引用
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 同步 URL 参数到输入框（当 URL 变化时，比如浏览器前进后退）
  useEffect(() => {
    if (!isComposingRef.current) {
      setSearchValue(keywordsFromUrl);
    }
  }, [keywordsFromUrl]);

  // 更新 URL 参数的函数（使用 useRef 存储，确保函数引用稳定）
  const updateUrlParamsRef = useRef((value: string) => {
    const newSearchParams = new URLSearchParams(window.location.search);
    if (value.trim()) {
      newSearchParams.set('keyword', value.trim());
    } else {
      newSearchParams.delete('keyword');
    }
    const newSearch = newSearchParams.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`
    );
    window.dispatchEvent(new Event('searchAssetKeywordChange'));
  });

  // 使用 useRef 创建防抖函数，确保防抖状态在整个组件生命周期中保持稳定
  const debouncedUpdateUrlRef = useRef(
    debounce((value: string) => {
      updateUrlParamsRef.current(value);
    }, 1000)
  );

  // 处理输入变化
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    // 如果不在组合输入状态，则更新 URL
    if (!isComposingRef.current) {
      debouncedUpdateUrlRef.current(value);
    }
  }, []);

  // 处理中文输入法开始
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  // 处理中文输入法结束
  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    // 使用 setTimeout 确保在 onChange 事件处理完成后再更新 URL
    // 从 inputRef 获取最新的值
    setTimeout(() => {
      if (inputRef.current) {
        debouncedUpdateUrlRef.current(inputRef.current.value);
      }
    }, 0);
  }, []);

  // 监听url参数变化
  // 监听 URL 参数变化（如浏览器前进、后退，或其他导致 search 变化的情况）
  useEffect(() => {
    const handleSearchAssetKeywordChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const curKeyword = urlParams.get('keyword')?.trim() || '';
      onKeywordChange?.(curKeyword);
    };
    window.addEventListener('searchAssetKeywordChange', handleSearchAssetKeywordChange);
    // 清理监听
    return () => {
      window.removeEventListener('searchAssetKeywordChange', handleSearchAssetKeywordChange);
    };
  }, [onKeywordChange]);

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: 'background.paper',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          gap: 1,
          borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
        }}
      >
        {/* 返回按钮 */}
        {showBackButton && (
          <IconButton
            component={m.button}
            whileTap={{ scale: 0.9 }}
            sx={{ color: 'text.primary', width: 24.0, height: 24.0 }}
            onClick={onBack}
          >
            <Iconify icon="eva:arrow-ios-back-fill" width={18} />
          </IconButton>
        )}

        {showAreaSelector && (
          <HorizontalStack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              dialogs.open(
                AddressSelectDrawer,
                { values: currentArea },
                {
                  onClose: async (res) => {
                    if (res) {
                      setCurrentArea({
                        district: res.district,
                        city: res.city,
                        province: res.province,
                      });
                    }
                  },
                }
              );
            }}
          >
            <Typography
              component="div"
              variant="subtitle1"
              sx={[
                (theme) => ({
                  ...theme.mixins.maxLine({ line: 1 }),
                  ml: 0.5,
                  flexWrap: 'nowrap',
                }),
              ]}
            >
              {currentArea.city?.label || currentArea.province?.label || '全国'}
              {currentArea.district && `/${currentArea.district?.label}`}
            </Typography>
            <Iconify icon="eva:arrow-ios-downward-fill" width={14} />
          </HorizontalStack>
        )}

        <Stack
          sx={{
            flex: 1,
            pl: 1.5,
            pr: 1,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: (theme) => theme.vars.palette.AppBar.defaultBg,
          }}
          alignItems="center"
          direction="row"
        >
          <Search sx={{ color: 'text.secondary', mr: 1 }} />
          {onSearchClick ? (
            <InputBase
              placeholder="搜索无人机、露营装备..."
              fullWidth
              value={searchValue}
              readOnly
              inputRef={inputRef}
              onClick={onSearchClick}
            />
          ) : (
            <>
              <InputBase
                placeholder="搜索无人机、露营装备..."
                fullWidth
                autoFocus={autoFocus === 'true'}
                value={searchValue}
                onChange={handleInputChange}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                onFocus={isFocus.onTrue}
                inputRef={inputRef}
              />
              {searchValue && isFocus.value && (
                <IconButton
                  onClick={() => {
                    setSearchValue('');
                    updateUrlParamsRef.current('');
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 300);
                  }}
                >
                  <Iconify icon="solar:close-circle-bold" />
                </IconButton>
              )}
            </>
          )}
        </Stack>
      </Toolbar>
      {extra}
    </AppBar>
  );
};
