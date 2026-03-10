import { m } from 'framer-motion';
import React, { useCallback } from 'react';
import { Star, Heart, MapPin, Shield } from 'lucide-react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Avatar,
  CardMedia,
  Typography,
  CardContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';

import { AmountTypography } from 'src/components/custom/amount-typography';

import { RENTAL_TYPE_UNIT_LABELS } from 'src/sections/rental/constants/rental-plan';

// ----------------------------------------------------------------------

interface CommunityAssetListCardProps {
  item: MyApi.OutputAssetListItemDto;
  index: number;
  onFavoriteChange: (isFavorite: boolean) => void;
}

export function CommunityAssetListCard({
  item,
  index,
  onFavoriteChange,
}: CommunityAssetListCardProps) {
  const router = useRouter();

  const handleCardClick = useCallback(() => {
    router.push(paths.rental.goods.detail(item.id));
  }, [item.id, router]);

  const handleFavoriteClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (item.isFavorite) {
        await API.AppFavorite.AppFavoriteControllerRemoveV1(
          { assetId: item.id },
          { fetchOptions: { showSuccess: false } }
        );
      } else {
        await API.AppFavorite.AppFavoriteControllerCreateV1(
          { assetId: item.id },
          { fetchOptions: { showSuccess: false } }
        );
      }

      onFavoriteChange(true);
    },
    [item, onFavoriteChange]
  );

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ backgroundColor: 'action.hover' }}
      whileTap={{ scale: 0.99 }}
      onClick={handleCardClick}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.vars.customShadows.card,
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
      }}
    >
      {/* 图片区 - 左侧 */}
      <Box
        sx={{
          position: 'relative',
          width: 120,
          minWidth: 120,
          height: 120,
          flexShrink: 0,
        }}
      >
        <CardMedia
          component="img"
          image={item.coverImage || item.images?.[0] || ''}
          loading="lazy"
          alt={item.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* 收藏按钮 */}
        <Stack
          component={m.div}
          whileTap={{ scale: 0.8 }}
          onClick={handleFavoriteClick}
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: item.isFavorite ? 'error.main' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)',
            width: 28,
            borderRadius: '50%',
            height: 28,
            color: item.isFavorite ? 'white' : 'text.secondary',
          }}
        >
          <Heart size={14} />
        </Stack>

        {/* 免押金标签 */}
        {item.deposit <= 0 && !item.isMallProduct && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          >
            <Chip
              icon={<Shield size={10} />}
              label="免押金"
              size="small"
              variant="filled"
              color="primary"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          </Box>
        )}
      </Box>

      {/* 内容区 - 右侧 */}
      <CardContent
        sx={{
          flex: 1,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
          '&:last-child': { pb: 1.5 },
        }}
      >
        <Box>
          {/* 标题 */}
          <Typography
            variant="subtitle2"
            sx={[
              (theme) => ({
                ...theme.mixins.maxLine({ line: 2 }),
                mb: 0.5,
                wordBreak: 'break-all',
              }),
            ]}
          >
            {item.name}
          </Typography>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={0.5}>
            {item.customTags?.slice(0, 3)?.map((tag, tagIndex) => (
              <Chip
                key={tagIndex}
                label={tag}
                size="small"
                variant="filled"
                color="secondary"
                sx={{ height: 16, fontSize: '0.5rem' }}
              />
            ))}
          </Stack>

          {/* 评分和距离 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Star size={12} fill="#fbbf24" color="#fbbf24" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {item.rating}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              ({item.viewCount})
            </Typography>
            <Box sx={{ flex: 1 }} />
            <MapPin size={12} color="#9ca3af" />
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                maxWidth: 80,
              }}
            >
              {item.contact?.city}
              {item.contact?.district}
            </Typography>
          </Box>
        </Box>

        {/* 价格和商家信息 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
          <AmountTypography
            color="error.main"
            slotProps={{
              amount: {
                variant: 'h3',
              },
            }}
            amount={item.rentalPlans?.[0]?.price}
            unit={
              item.isMallProduct
                ? ''
                : `/${RENTAL_TYPE_UNIT_LABELS[item.rentalPlans?.[0]?.rentalType || 'daily']}`
            }
          />

          <Avatar
            src={item.owner?.avatar}
            sx={{
              width: 24,
              height: 24,
              border: '2px solid',
              borderColor: item.owner?.isVerified ? 'primary.main' : 'divider',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
