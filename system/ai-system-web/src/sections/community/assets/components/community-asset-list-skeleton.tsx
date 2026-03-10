import { m } from 'framer-motion';

import { Box, Card, Skeleton, CardContent } from '@mui/material';

// ----------------------------------------------------------------------

interface CommunityAssetListSkeletonProps {
  index?: number;
}

export function CommunityAssetListSkeleton({ index = 0 }: CommunityAssetListSkeletonProps) {
  return (
    <Card
      component={m.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.vars.customShadows.card,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
      }}
    >
      {/* 图片骨架 */}
      <Skeleton
        variant="rectangular"
        width={120}
        height={120}
        animation="wave"
        sx={{ flexShrink: 0 }}
      />

      {/* 内容骨架 */}
      <CardContent sx={{ flex: 1, p: 1.5, minWidth: 0 }}>
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Skeleton variant="rounded" width={40} height={14} />
          <Skeleton variant="rounded" width={50} height={14} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
      </CardContent>
    </Card>
  );
}
