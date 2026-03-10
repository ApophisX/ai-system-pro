import type { AssetSortBy } from 'src/sections/rental/rental-goods/goods-filter';

import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Box } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';

import { ListEmptyContent } from 'src/components/empty-content';

import { SearchHeader } from 'src/sections/home/search-header';
import { GoodsFilter } from 'src/sections/rental/rental-goods/goods-filter';

import { CommunityAssetsList } from '../components/community-assets-list';

// ----------------------------------------------------------------------

export function CommunityAssetsView() {
  const params = useParams();
  const communityId = params.id;
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const sort = searchParams.get('sortBy') as AssetSortBy;
  const keywordParams = searchParams.get('keyword')?.trim();

  // 查询社区信息
  const { data: community } = useQuery({
    queryKey: ['community', communityId],
    gcTime: 0,
    staleTime: 0,
    enabled: !!communityId,
    queryFn: () => API.AppCommunity.AppCommunityControllerGetDetailV1({ id: communityId! }),
    select: (res) => res.data.data,
  });

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

  useEffect(() => {
    if (community) {
      document.title = `${community.name}`;
    }
  }, [community]);

  if (!communityId) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflowX: 'hidden',
        pt: { xs: 18, md: 20 },
      }}
    >
      <SearchHeader
        showBackButton
        showAreaSelector={false}
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

      <CommunityAssetsList
        category={activeCategory}
        sortBy={sortBy}
        communityId={communityId}
        keyword={keyword}
        slot={{
          emptyContent: (
            <ListEmptyContent
              imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
              title="该社区暂无商品"
              description="换个分类看看吧~"
            />
          ),
        }}
      />
    </Box>
  );
}
