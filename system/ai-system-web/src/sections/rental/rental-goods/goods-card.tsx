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
  IconButton,
  CardContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';

import { AmountTypography } from 'src/components/custom/amount-typography';

import { RENTAL_TYPE_UNIT_LABELS } from '../constants/rental-plan';

// ----------------------------------------------------------------------

export interface GoodsItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  unit: string;
  distance: string;
  image: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  ownerAvatar: string;
  ownerName: string;
  isVerified: boolean;
  depositFree: boolean;
}

interface GoodsCardProps {
  item: MyApi.OutputAssetListItemDto;
  index: number;
  onFavoriteChange: (isFavorite: boolean) => void;
}

export const GoodsCard: React.FC<GoodsCardProps> = ({ item, index, onFavoriteChange }) => {
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
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.vars.customShadows.card,
        cursor: 'pointer',
        position: 'relative',
        mb: 2,
        break: 'inside-avoid',
      }}
    >
      {/* 图片区 */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          image={item.coverImage || item.images?.[0] || ''}
          loading="lazy"
          alt={item.name}
          sx={{
            objectFit: 'contain',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
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
            width: 32,
            borderRadius: '50%',
            height: 32,
            color: item.isFavorite ? 'white' : 'text.secondary',
          }}
        >
          <Heart size={16} />
        </Stack>

        {/* 标签组 */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
          }}
        >
          {item.deposit <= 0 && !item.isMallProduct && (
            <Chip
              icon={<Shield size={12} />}
              label="免押金"
              size="small"
              variant="filled"
              color="primary"
              sx={{
                height: 22,
              }}
            />
          )}
        </Box>
      </Box>

      {/* 内容区 */}
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
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

        <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={0.8}>
          {item.customTags?.slice(0, 3)?.map((tag, tagIndex) => (
            <Chip
              key={tagIndex}
              label={tag}
              size="small"
              variant="filled"
              color="secondary"
              sx={{
                height: 16,
                fontSize: '0.5rem',
              }}
            />
          ))}
        </Stack>

        {/* 评分和距离 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
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
            }}
          >
            {item.contact.city}
            {item.contact.district}
          </Typography>
        </Box>

        {/* 价格和商家信息 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
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
                  : `/${RENTAL_TYPE_UNIT_LABELS[item.rentalPlans[0].rentalType]}`
              }
            />
            {/* <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                textDecoration: 'line-through',
                ml: 0.5,
              }}
            >
              ¥{99}
            </Typography> */}
          </Box>

          {/* 商家头像 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Avatar
              src={item.owner.avatar}
              sx={{
                width: 28,
                height: 28,
                border: '2px solid',
                borderColor: item.owner.isVerified ? 'primary.main' : 'divider',
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
