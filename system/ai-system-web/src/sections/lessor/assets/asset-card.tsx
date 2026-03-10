import { m } from 'framer-motion';
import React, { useMemo } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import { Box, Card, Chip, Stack, Button, Typography } from '@mui/material';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { AmountTypography } from 'src/components/custom/amount-typography';

import { RENTAL_TYPE_UNIT_LABELS } from 'src/sections/rental/constants/rental-plan';

import { useAssetStatus } from './hooks/use-asset-status';
import { getAssetStatusText, getAssetStatusColor } from './utils/asset-status';

// ----------------------------------------------------------------------

type AssetCardProps = {
  asset: MyApi.OutputMyAssetListItemDto;
  index: number;
  onEdit?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onOffline?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onOnline?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export function AssetCard(props: AssetCardProps) {
  const { asset, index = 0, onEdit, onOffline, onOnline, onClick } = props;

  const statusColor = useMemo(() => getAssetStatusColor(asset), [asset]);
  const statusText = useMemo(() => getAssetStatusText(asset), [asset]);

  const { isOnline, editable, canPublish } = useAssetStatus(asset);

  return (
    <Card
      key={asset.id}
      component={m.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      sx={{ p: 1.5, display: 'flex', gap: 1.5, position: 'relative', alignItems: 'stretch' }}
      onClick={onClick}
    >
      <Box sx={{ width: 120, height: 120, borderRadius: 1.5, flexShrink: 0, position: 'relative' }}>
        <Image
          src={asset.coverImage || asset.images?.[0] || ''}
          alt={asset.name}
          sx={{
            width: 120,
            height: 120,
            borderRadius: 1.5,
            flexShrink: 0,
            bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
          }}
          slotProps={{ img: { sx: { objectFit: 'contain' } } }}
        />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            px: 2,
            py: 0.5,
            bgcolor: statusColor,
            borderTopRightRadius: (theme) => Number(theme.shape.borderRadius) * 1.5,
            borderBottomLeftRadius: (theme) => Number(theme.shape.borderRadius) * 1.5,
          }}
        >
          <Typography variant="caption" sx={{ lineHeight: 1, color: 'white' }}>
            {statusText}
          </Typography>
        </Stack>
      </Box>

      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography
            variant="subtitle1"
            noWrap
            sx={[
              (theme) => ({
                ...theme.mixins.maxLine({ line: 1 }),
                flex: 1,
                wordBreak: 'break-word',
                fontWeight: 'bold',
              }),
            ]}
          >
            {asset.name}
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {asset.createdAt.substring(0, 10)}
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          sx={[
            (theme) => ({
              color: theme.palette.text.secondary,
              ...theme.mixins.maxLine({ line: 1 }),
              wordBreak: 'break-word',
            }),
          ]}
        >
          {asset.description}
        </Typography>

        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
          mt={0.5}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Chip
              label={asset.categoryName}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: 10, borderRadius: 0.5 }}
            />
            {asset.customTags?.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                color="info"
                sx={{ height: 20, fontSize: 10, borderRadius: 0.5 }}
              />
            ))}
          </Stack>
          <Box>
            <AmountTypography
              amount={asset.rentalPlans?.[0].price || 0}
              unit={
                asset.isMallProduct
                  ? ''
                  : `/${RENTAL_TYPE_UNIT_LABELS[asset.rentalPlans?.[0].rentalType || 'daily']}`
              }
              slotProps={{
                amount: {
                  variant: 'h6',
                },
                wrapper: { sx: { flexShrink: 0, flexWrap: 'nowrap' } },
              }}
            />
            <Typography
              component="div"
              variant="caption"
              sx={{ color: 'text.secondary', textAlign: 'right' }}
            >
              {asset.rentalPlans.length}个方案
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              {isOnline && (
                <>
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{ color: 'text.secondary', fontSize: 12 }}
                  >
                    <Iconify icon="solar:eye-bold" width={14} sx={{ mr: 0.5 }} />
                    {asset.viewCount}
                  </Stack>
                  {/* <Stack
                    direction="row"
                    alignItems="center"
                    sx={{ color: 'text.secondary', fontSize: 12 }}
                  >
                    <Iconify icon="solar:case-minimalistic-bold" width={14} sx={{ mr: 0.5 }} />
                    {asset.rentalCount}
                  </Stack> */}
                </>
              )}
              <Stack
                direction="row"
                alignItems="center"
                sx={{ color: 'text.secondary', fontSize: 12 }}
              >
                <Iconify icon="solar:box-minimalistic-bold" width={14} sx={{ mr: 0.5 }} />
                {asset.availableQuantity}
              </Stack>
            </Stack>
          </Box>

          <Box flex={1} />

          {editable && (
            <Button variant="soft" size="small" onClick={onEdit}>
              编辑
            </Button>
          )}
          {isOnline && (
            <Button variant="contained" size="small" color="error" onClick={onOffline}>
              下架
            </Button>
          )}
          {canPublish && (
            <Button variant="soft" size="small" color="inherit" onClick={onOnline}>
              发布
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
