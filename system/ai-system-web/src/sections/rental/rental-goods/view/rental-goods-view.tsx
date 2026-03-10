import type { AssetSortBy } from '../goods-filter';

import React, { useState, useEffect } from 'react';

import { Box } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { SearchHeader } from 'src/sections/home/search-header';

import { GoodsFilter } from '../goods-filter';
import { GoodsWaterfall } from '../goods-waterfall';

// ----------------------------------------------------------------------

export function RentalGoodsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  // 旧链接兼容：/rental/goods?lessorId=xxx 重定向至出租方店铺页
  const lessorId = searchParams.get('lessorId');
  useEffect(() => {
    if (lessorId) {
      const params = new URLSearchParams(window.location.search);
      params.delete('lessorId');
      const query = params.toString();
      router.replace(`${paths.rental.shop(lessorId)}${query ? `?${query}` : ''}`);
    }
  }, [lessorId, router]);

  const sort = searchParams.get('sortBy') as AssetSortBy;
  const keywordParams = searchParams.get('keyword');
  const [activeCategory, setActiveCategory] = useState<string>(category || 'all');
  const [sortBy, setSortBy] = useState<AssetSortBy>(sort || 'recommend');
  const [keyword, setKeyword] = useState(keywordParams || '');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const curCategory = urlParams.get('category')?.trim();
    const curSort = urlParams.get('sortBy')?.trim() as AssetSortBy;
    if (activeCategory && activeCategory !== curCategory) {
      urlParams.set('category', activeCategory);
    }
    if (sortBy && sortBy !== curSort) {
      urlParams.set('sortBy', sortBy);
    }

    window.history.replaceState(null, '', `${window.location.pathname}?${urlParams.toString()}`);
  }, [activeCategory, sortBy]);

  if (lessorId) {
    return null;
  }
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflowX: 'hidden',
        pt: {
          xs: 18,
          md: 20,
        },
      }}
    >
      {/* 吸顶头部 */}
      <SearchHeader
        showBackButton
        onKeywordChange={setKeyword}
        extra={
          <GoodsFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        }
      />

      {/* 商品瀑布流列表 */}
      <GoodsWaterfall category={activeCategory} sortBy={sortBy as AssetSortBy} keyword={keyword} />

      {/* 固定底部导航 */}
      {/* <BottomNav value={activeTab} onChange={setActiveTab} /> */}
    </Box>
  );
}
