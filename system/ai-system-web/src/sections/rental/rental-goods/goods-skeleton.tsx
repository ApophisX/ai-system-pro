import React from 'react';
import { m } from 'framer-motion';

import { Box, Card, Skeleton, CardContent, Grid } from '@mui/material';

// ----------------------------------------------------------------------

interface GoodsSkeletonProps {
  count?: number;
}

export const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
  // 模拟瀑布流的不同高度
  const imageHeight = index % 2 === 0 ? 200 : index % 2 === 1 ? 160 : 180;

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: (theme) => theme.vars.palette.background.paper,
        boxShadow: (theme) => theme.vars.customShadows.card,
        mb: 2,
      }}
    >
      {/* 图片骨架 */}
      <Skeleton
        variant="rectangular"
        height={imageHeight}
        animation="wave"
        sx={{
          bgcolor: (theme) => theme.vars.palette.background.paper,
        }}
      />

      {/* 内容骨架 */}
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* 标题骨架 */}
        <Skeleton
          variant="text"
          width="90%"
          height={20}
          animation="wave"
          sx={{ mb: 0.5, bgcolor: (theme) => theme.vars.palette.background.paper }}
        />
        <Skeleton
          variant="text"
          width="60%"
          height={20}
          animation="wave"
          sx={{ mb: 1, bgcolor: (theme) => theme.vars.palette.background.paper }}
        />

        {/* 评分骨架 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Skeleton
            variant="rounded"
            width={50}
            height={14}
            animation="wave"
            sx={{ bgcolor: (theme) => theme.vars.palette.background.paper }}
          />
          <Skeleton
            variant="rounded"
            width={40}
            height={14}
            animation="wave"
            sx={{ bgcolor: (theme) => theme.vars.palette.background.paper }}
          />
        </Box>

        {/* 价格和头像骨架 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Skeleton
              variant="rounded"
              width={60}
              height={24}
              animation="wave"
              sx={{ bgcolor: (theme) => theme.vars.palette.background.paper }}
            />
            <Skeleton
              variant="rounded"
              width={30}
              height={14}
              animation="wave"
              sx={{ bgcolor: (theme) => theme.vars.palette.background.paper }}
            />
          </Box>
          <Skeleton
            variant="circular"
            width={22}
            height={22}
            animation="wave"
            sx={{ bgcolor: (theme) => theme.vars.palette.background.paper }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export const GoodsSkeleton: React.FC<GoodsSkeletonProps> = ({ count = 6 }) => (
  <Grid container spacing={2}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid key={index} size={{ xs: 6 }}>
        <SkeletonCard index={index} />
      </Grid>
    ))}
  </Grid>
);

// 加载更多的骨架屏（用于上拉加载）
export const LoadMoreSkeleton: React.FC = () => (
  <Box
    sx={{
      columnCount: 2,
      columnGap: 2,
      mt: 2,
      width: '100%',
    }}
  >
    {[0, 1].map((index) => (
      <SkeletonCard key={`load-more-${index}`} index={index} />
    ))}
  </Box>
);
