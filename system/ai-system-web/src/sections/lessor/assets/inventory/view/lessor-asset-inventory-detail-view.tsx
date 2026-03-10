import { Box, Stack, Avatar, Button, Skeleton, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useParams } from 'src/routes/hooks/use-params';

import API from 'src/services/API';
import { useApiQuery } from 'src/lib/use-api-query';
import { fDate, fDateTime, fCurrency, fDurationSeconds } from 'src/utils';
import {
  AssetInventoryStatus,
  AssetInventoryStatusColors,
  AssetInventoryStatusLabels,
} from 'src/constants/asset-inventory';

import { Iconify } from 'src/components/iconify';
import { MultiFilePreview } from 'src/components/upload';
import { EmptyContent } from 'src/components/empty-content';
import { MobileLayout, HorizontalStack } from 'src/components/custom/layout';

import { InventoryQrcode } from '../inventory-qrcode';
import { useInventoryAction } from '../hooks/use-inventory-action';
import { InventoryInstanceCardAction } from '../inventory-instance-card-action';
import {
  StatusChip,
  BoundUserRow,
  QuantityGrid,
  QuantityItem,
  DetailInfoRow,
  DetailBlockCard,
  InstanceCardRoot,
  DetailSectionTitle,
  InstanceCardStatusBar,
} from '../styled';

// ----------------------------------------------------------------------

const StatusBarColorMap: Record<string, string> = {
  success: 'success.main',
  warning: 'warning.main',
  error: 'error.main',
  info: 'info.main',
  default: 'grey.500',
};

// ----------------------------------------------------------------------

function InstanceDetailSkeleton() {
  return (
    <Stack spacing={2}>
      <InstanceCardRoot sx={{ pointerEvents: 'none' }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Skeleton variant="text" width="50%" height={32} />
            <Skeleton variant="rounded" width={72} height={28} sx={{ borderRadius: 2 }} />
          </Stack>
          <Box>
            <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            >
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={22} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="45%" height={18} />
              </Box>
            </Box>
          </Box>
          <Box>
            <Skeleton variant="text" width="28%" height={20} sx={{ mb: 1 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 1.5 }} />
              ))}
            </Box>
          </Box>
        </Stack>
      </InstanceCardRoot>
      <Stack direction="row" spacing={1.5} flexWrap="wrap">
        <Skeleton variant="rounded" width={80} height={40} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" width={80} height={40} sx={{ borderRadius: 2 }} />
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function LessorAssetInventoryDetailView() {
  const params = useParams();
  const assetId = (params.id ?? '') as string;
  const instanceId = (params.instanceId ?? '') as string;
  const router = useRouter();

  const {
    data: instance,
    isLoading: dataLoading,
    refetch,
  } = useApiQuery(
    () =>
      API.AppAssetInventory.AppAssetInventoryControllerGetByIdV1({
        id: instanceId,
      }),
    { queryKey: ['asset-inventory-detail', instanceId], staleTime: 0 }
  );
  const actions = useInventoryAction({ onDeleteSuccess: router.back, callback: refetch });

  const statusKey = instance?.status as keyof typeof AssetInventoryStatusLabels | undefined;
  const statusColor =
    statusKey && AssetInventoryStatusColors[statusKey]
      ? AssetInventoryStatusColors[statusKey]
      : 'default';

  const statusBarColor = StatusBarColorMap[statusColor] || StatusBarColorMap.default;

  const displayName = instance?.instanceName || instance?.instanceCode || '实例详情';

  const statItems = instance
    ? [
        {
          key: 'idleDuration',
          label: '空闲时长',
          value: fDurationSeconds(instance.idleDuration),
        },
        {
          key: 'totalRentalDuration',
          label: '累计出租时长',
          value: fDurationSeconds(instance.totalRentalDuration),
        },
        { key: 'rentalCount', label: '使用次数', value: String(instance.rentalCount) },
        { key: 'rebindCount', label: '换绑次数', value: String(instance.rebindCount) },
      ]
    : [];

  const handleBack = () => router.replace(paths.lessor.assets.inventory.list(assetId));
  const handleOrderDetail = () => {
    if (instance?.order?.id) router.push(paths.lessor.order.detail(instance.order.id));
  };
  /** 查看出租记录：跳转订单列表并带资产 ID 筛选（该资产下的订单即包含本实例的出租） */
  const handleRentalRecords = () => {
    router.push(`${paths.lessor.order.list}?assetId=${assetId}`);
  };
  /** 查看换绑记录：换绑发生在订单流程中，跳转订单列表便于查看该资产相关订单 */
  const handleRebindRecords = () => {
    router.push(`${paths.lessor.order.list}?assetId=${assetId}`);
  };

  if (dataLoading) {
    return (
      <MobileLayout appTitle="实例详情" containerProps={{ maxWidth: 'sm' }}>
        <InstanceDetailSkeleton />
      </MobileLayout>
    );
  }

  if (!instance) {
    return (
      <MobileLayout appTitle="实例详情">
        <EmptyContent
          title="实例不存在"
          description="该实例可能已删除"
          sx={{ py: 10 }}
          action={
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleBack}>
              返回实例列表
            </Button>
          }
        />
      </MobileLayout>
    );
  }

  const order = instance.order;
  const lessee = instance.lessee;
  const hasImages = (instance.images?.length ?? 0) > 0;

  return (
    <MobileLayout
      appTitle={displayName}
      sx={{ pb: 0 }}
      containerProps={{ maxWidth: 'sm', sx: { pb: 14 } }}
    >
      <>
        {/* 头部：实例名称 + 状态 */}
        <InstanceCardRoot sx={{ mb: 2 }}>
          <InstanceCardStatusBar sx={{ bgcolor: statusBarColor }} />
          <HorizontalStack>
            <Typography variant="h6" fontWeight={700} noWrap flex={1}>
              {displayName}
            </Typography>
            <StatusChip
              label={
                AssetInventoryStatusLabels[
                  instance.status as keyof typeof AssetInventoryStatusLabels
                ] ?? instance.status
              }
              color={statusColor}
              size="small"
            />
          </HorizontalStack>
          <Box sx={{ mt: 1 }}>
            {instance.instanceCode && (
              <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.25 }}>
                编号：{instance.instanceCode}
              </Typography>
            )}
            {instance.orderNo && (
              <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.25 }}>
                订单：{instance.orderNo}
              </Typography>
            )}
          </Box>
        </InstanceCardRoot>

        {/* 资产图片（有图时展示，点击用 Lightbox 查看） */}
        {hasImages && (
          <DetailBlockCard sx={{ mb: 2 }}>
            <DetailSectionTitle sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <Iconify icon="solar:gallery-wide-bold" width={18} />
              实例图片
            </DetailSectionTitle>
            <MultiFilePreview files={instance.images ?? []} />
          </DetailBlockCard>
        )}
        {/* 实例二维码 */}
        <InventoryQrcode
          assetId={assetId}
          instanceId={instanceId}
          inventoryCode={instance.instanceCode}
        />

        {/* 关联订单（仅已占用且有关联订单时） */}
        {instance.status === AssetInventoryStatus.RENTED && order && (
          <DetailBlockCard sx={{ mb: 2 }}>
            <DetailSectionTitle sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <Iconify icon="solar:file-bold-duotone" width={18} />
              关联订单
            </DetailSectionTitle>
            <Stack spacing={0.5}>
              <DetailInfoRow>
                <Typography variant="body2" color="text.secondary">
                  订单号
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ cursor: 'pointer', color: 'primary.main' }}
                  onClick={handleOrderDetail}
                >
                  {order.orderNo}
                </Typography>
              </DetailInfoRow>
              <DetailInfoRow>
                <Typography variant="body2" color="text.secondary">
                  订单状态
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {order.statusLabel}
                </Typography>
              </DetailInfoRow>
              {order.startDate && order.endDate && (
                <DetailInfoRow>
                  <Typography variant="body2" color="text.secondary">
                    租期
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fDate(order.startDate)} — {fDate(order.endDate)}
                  </Typography>
                </DetailInfoRow>
              )}
              <DetailInfoRow>
                <Typography variant="body2" color="text.secondary">
                  联系人
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {order.contactName} {order.contactPhone}
                </Typography>
              </DetailInfoRow>
              <DetailInfoRow sx={{ borderBottom: 'none' }}>
                <Typography variant="body2" color="text.secondary">
                  租金 / 押金
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {fCurrency(order.rentalAmount)} / {fCurrency(order.depositAmount)}
                </Typography>
              </DetailInfoRow>
            </Stack>
            <Button
              fullWidth
              variant="soft"
              color="primary"
              size="small"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
              onClick={handleOrderDetail}
              sx={{ mt: 1.5, borderRadius: 1.5 }}
            >
              查看订单详情
            </Button>
          </DetailBlockCard>
        )}

        {/* 承租人信息（仅已占用且有 lessee 时） */}
        {instance.status === AssetInventoryStatus.RENTED && lessee && (
          <DetailBlockCard sx={{ mb: 2 }}>
            <DetailSectionTitle sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <Iconify icon="solar:user-id-bold" width={18} />
              承租人信息
            </DetailSectionTitle>
            <BoundUserRow sx={{ p: 0 }}>
              <Avatar
                src={lessee.avatar ?? ''}
                sx={{ width: 48, height: 48, flexShrink: 0, alignSelf: 'flex-start' }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {lessee.profile?.realName || lessee.username || '未绑定用户'}
                </Typography>
                {lessee.phone && (
                  <Typography variant="body2" color="text.secondary" noWrap display="block">
                    {lessee.phone}
                  </Typography>
                )}
                {typeof lessee.creditScore === 'number' && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    display="block"
                    sx={{ mt: 0.25 }}
                  >
                    信用分 {lessee.creditScore}
                  </Typography>
                )}
              </Box>
              {instance.boundAt && (
                <Stack alignItems="flex-end" spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    绑定于
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fDateTime(instance.boundAt)}
                  </Typography>
                </Stack>
              )}
            </BoundUserRow>
          </DetailBlockCard>
        )}

        {/* 使用统计 */}
        <DetailBlockCard sx={{ mb: 2 }}>
          <DetailSectionTitle sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <Iconify icon="solar:box-minimalistic-bold" width={18} />
            使用统计
          </DetailSectionTitle>
          <QuantityGrid>
            {statItems.map(({ key, label, value }) => (
              <QuantityItem key={key}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {value}
                </Typography>
              </QuantityItem>
            ))}
          </QuantityGrid>
        </DetailBlockCard>

        {/* 出租记录 */}
        <DetailBlockCard sx={{ mb: 2 }}>
          <DetailSectionTitle sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <Iconify icon="solar:clock-circle-bold" width={18} />
            出租记录
          </DetailSectionTitle>
          <Stack spacing={1.5}>
            <DetailInfoRow sx={{ borderBottom: 'none', py: 0 }}>
              <Typography variant="body2" color="text.secondary">
                共出租
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {instance.rentalCount} 次
              </Typography>
            </DetailInfoRow>
            <Button
              fullWidth
              variant="soft"
              color="primary"
              size="small"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
              onClick={handleRentalRecords}
              sx={{ borderRadius: 1.5 }}
            >
              查看出租记录
            </Button>
          </Stack>
        </DetailBlockCard>

        {/* 换绑记录 */}
        <DetailBlockCard sx={{ mb: 2 }}>
          <DetailSectionTitle sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <Iconify icon="solar:copy-bold" width={18} />
            换绑记录
          </DetailSectionTitle>
          <Stack spacing={1.5}>
            <DetailInfoRow sx={{ borderBottom: 'none', py: 0 }}>
              <Typography variant="body2" color="text.secondary">
                共换绑
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {instance.rebindCount} 次
              </Typography>
            </DetailInfoRow>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
              换绑发生在订单流程中，可在订单列表查看该资产相关订单
            </Typography>
            <Button
              fullWidth
              variant="soft"
              color="primary"
              size="small"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
              onClick={handleRebindRecords}
              sx={{ borderRadius: 1.5 }}
            >
              查看换绑记录
            </Button>
          </Stack>
        </DetailBlockCard>

        {/* 备注与时间 */}
        {(instance.remark || instance.createdAt) && (
          <DetailBlockCard sx={{ mb: 2 }}>
            {instance.remark && (
              <Box sx={{ mb: 1.5 }}>
                <DetailSectionTitle>备注</DetailSectionTitle>
                <Typography variant="body2" color="text.secondary">
                  {instance.remark}
                </Typography>
              </Box>
            )}
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ pt: instance.remark ? 1 : 0 }}>
              <Typography variant="caption" color="text.disabled">
                创建：{fDateTime(instance.createdAt)}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                更新：{fDateTime(instance.updatedAt)}
              </Typography>
            </Stack>
          </DetailBlockCard>
        )}

        {/* 底部操作栏：fixed 贴底，与列表卡片一致 + 返回列表 */}
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            py: 2,
            px: 2,
            bgcolor: 'background.paper',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          }}
        >
          <Container maxWidth="sm" disableGutters>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
              flexWrap="wrap"
              gap={1.5}
            >
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={18} />}
                onClick={handleBack}
                sx={{ borderRadius: 2 }}
              >
                返回列表
              </Button>
              <Box sx={{ flex: 1 }} />
              <InventoryInstanceCardAction instance={instance} assetId={assetId} {...actions} />
            </Stack>
          </Container>
        </Box>
      </>
    </MobileLayout>
  );
}
