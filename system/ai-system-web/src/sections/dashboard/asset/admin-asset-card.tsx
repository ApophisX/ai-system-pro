import type { AssetStatus } from 'src/constants/assets';

import { useMemo } from 'react';
import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import { Box, Card, Chip, Stack, Button, Typography, CardContent } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { AssetAuditStatus, AssetStatusLabels, AssetAuditStatusLabels } from 'src/constants/assets';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { HorizontalStack } from 'src/components/custom/layout';
import { AmountTypography } from 'src/components/custom/amount-typography';

import { RENTAL_TYPE_UNIT_LABELS } from 'src/sections/rental/constants/rental-plan';
import { getAssetStatusColor, getAssetStatusText } from 'src/sections/lessor/assets/utils';

// ----------------------------------------------------------------------

type Item = MyApi.OutputAssetAdminListItemDto;

const AUDIT_STATUS_COLOR_MAP: Partial<
  Record<Item['auditStatus'], 'warning' | 'success' | 'error' | 'info' | 'default'>
> = {
  pending: 'warning',
  auditing: 'warning',
  approved: 'success',
  rejected: 'error',
};

type AdminAssetCardProps = {
  item: Item;
  index: number;
  onAuditApprove?: (item: Item) => void;
  onAuditReject?: (item: Item) => void;
  onForceOffline?: (item: Item) => void;
  loading?: boolean;
};

export function AdminAssetCard({
  item,
  index,
  onAuditApprove,
  onAuditReject,
  onForceOffline,
  loading,
}: AdminAssetCardProps) {
  const router = useRouter();

  const canAudit = useMemo(
    () => item.auditStatus === 'auditing' && item.status === 'available',
    [item.auditStatus, item.status]
  );

  const canForceOffline = useMemo(
    () => item.auditStatus === 'approved' && item.status === 'available',
    [item.auditStatus, item.status]
  );

  const statusText = useMemo(() => getAssetStatusText(item), [item]);
  const statusColor = useMemo(() => getAssetStatusColor(item), [item]);

  const firstRentalPlan = item.rentalPlans?.[0];
  const priceUnit = firstRentalPlan?.rentalType
    ? `/${RENTAL_TYPE_UNIT_LABELS[firstRentalPlan.rentalType as keyof typeof RENTAL_TYPE_UNIT_LABELS] ?? '天'}`
    : '/天';

  const coverImage = item.coverImage || item.images?.[0] || '';

  const handleCardClick = () => {
    router.push(paths.rental.goods.detail(item.id));
  };

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      sx={{
        overflow: 'hidden',
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'border-color'], {
            duration: theme.transitions.duration.short,
          }),
        cursor: 'pointer',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z8,
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="stretch">
          {/* 封面图 */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: 1.5,
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
            }}
          >
            <Image
              src={coverImage}
              alt={item.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
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

          {/* 内容区 */}
          <Stack sx={{ flex: 1, minWidth: 0 }} justifyContent="space-between">
            <Stack spacing={0.5}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Typography
                  variant="subtitle1"
                  sx={(theme) => ({
                    flex: 1,
                    fontWeight: 700,
                    ...theme.mixins.maxLine({ line: 2 }),
                  })}
                >
                  {item.name}
                </Typography>
                <Chip
                  label={item.categoryName}
                  size="small"
                  color="primary"
                  sx={{ height: 22, fontSize: 11, flexShrink: 0 }}
                />
                {item.isMallProduct && (
                  <Chip
                    label="商城商品"
                    size="small"
                    color="error"
                    sx={{ height: 22, fontSize: 11, flexShrink: 0 }}
                  />
                )}
              </Stack>

              {item.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={(theme) => theme.mixins.maxLine({ line: 1 })}
                >
                  {item.description}
                </Typography>
              )}

              <HorizontalStack flexWrap="wrap" spacing={1} sx={{ typography: 'caption' }}>
                {item.owner && (
                  <>
                    <HorizontalStack spacing={0.5} sx={{ color: 'text.secondary' }}>
                      <Iconify icon="solar:user-id-bold" width={14} />
                      <Typography variant="caption">
                        {item.owner.nickname || item.owner.username || item.ownerId}
                      </Typography>
                    </HorizontalStack>
                    <HorizontalStack spacing={0.5} sx={{ color: 'text.secondary' }}>
                      <Iconify icon="solar:phone-bold" width={14} />
                      <Typography variant="caption">{item.contactPhone}</Typography>
                    </HorizontalStack>
                  </>
                )}
              </HorizontalStack>
            </Stack>

            <HorizontalStack justifyContent="space-between" alignItems="flex-end" flexWrap="wrap">
              <Box>
                <AmountTypography
                  amount={firstRentalPlan?.price ?? 0}
                  unit={item.isMallProduct ? '' : priceUnit}
                  slotProps={{
                    amount: { variant: 'h6' as const },
                    wrapper: { sx: { flexShrink: 0 } },
                  }}
                />
                {item.isMallProduct ? (
                  <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                    {item.rentalPlans.length}个价格方案
                  </Typography>
                ) : (
                  <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                    {item.rentalPlans.length}个租赁方案
                  </Typography>
                )}
              </Box>
              {(canAudit || canForceOffline) && (
                <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
                  {canAudit && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAuditReject?.(item);
                        }}
                        disabled={loading}
                      >
                        拒绝
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAuditApprove?.(item);
                        }}
                        disabled={loading}
                      >
                        通过
                      </Button>
                    </>
                  )}
                  {canForceOffline && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onForceOffline?.(item);
                      }}
                      disabled={loading}
                    >
                      强制下架
                    </Button>
                  )}
                </Stack>
              )}
            </HorizontalStack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
