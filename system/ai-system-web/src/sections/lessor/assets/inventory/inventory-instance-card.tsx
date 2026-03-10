
import type { InventoryInstanceCardActionProps } from './inventory-instance-card-action';

import { m } from 'framer-motion';
import React, { useMemo } from 'react';

import { Box, Stack, Avatar, Divider, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils';
import {
  AssetInventoryStatus,
  AssetInventoryStatusColors,
  AssetInventoryStatusLabels,
} from 'src/constants/asset-inventory';

import { Iconify } from 'src/components/iconify';
import { HorizontalStack } from 'src/components/custom/layout';

import { InventoryInstanceCardAction } from './inventory-instance-card-action';
import {
  StatusChip,
  BoundUserRow,
  QuantityGrid,
  QuantityItem,
  InstanceCardBody,
  InstanceCardRoot,
  InstanceCardHeader,
  InstanceCardStatusBar,
} from './styled';

// ----------------------------------------------------------------------


type InventoryInstanceCardProps = {
  instance: MyApi.OutputAssetInventoryDto;
  assetId: string;
  index: number;
  slotProps?: {
    action?: Omit<InventoryInstanceCardActionProps, 'instance' | 'assetId'>;
  };
};

/** 将小时数格式化为「X天」或「X小时」 */
function formatDurationHours(seconds: number | undefined): string {
  if (seconds === undefined || seconds === null) return '—';
  if (seconds >= 24 * 60 * 60) {
    const days = Math.floor(seconds / 24 / 60 / 60);
    return `${days}天`;
  }
  return `${Math.round(seconds / 60 / 60)}小时`;
}

export function InventoryInstanceCard({ instance, assetId, index, slotProps }: InventoryInstanceCardProps) {
  const statusColor = useMemo(
    () =>
      AssetInventoryStatusColors[instance.status as keyof typeof AssetInventoryStatusLabels] ??
      'default',
    [instance.status]
  );

  const statusBarColor = useMemo(() => {
    const map: Record<string, string> = {
      success: 'success.main',
      warning: 'warning.main',
      error: 'error.main',
      info: 'info.main',
      default: 'grey.500',
    };
    return map[statusColor] ?? 'grey.500';
  }, [statusColor]);

  const displayName =
    instance.instanceName ||
    instance.instanceCode ||
    `实例 #${(index + 1).toString().padStart(2, '0')}`;

  const statItems = useMemo(() => [
    { key: 'idleDuration', label: '空闲时长', value: formatDurationHours(instance.idleDuration) },
    { key: 'totalRentalDuration', label: '出租时长', value: formatDurationHours(instance.totalRentalDuration) },
    { key: 'rentalCount', label: '使用次数', value: instance.rentalCount.toString() },
    { key: 'rebindCount', label: '换绑次数', value: instance.rebindCount.toString() },
  ], [instance]);

  return (
    <Box
      component={m.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: (index % 10) * 0.06 }}
    >
      <InstanceCardRoot onClick={slotProps?.action?.handleClick} data-asset-id={assetId} data-instance-id={instance.id}>
        <InstanceCardStatusBar sx={{ bgcolor: statusBarColor }} />
        <InstanceCardHeader sx={{ alignItems: "flex-start" }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {displayName}
            </Typography>
            {instance.instanceCode && instance.instanceName && (
              <Stack>
                <Typography variant="body2" color="text.secondary" noWrap>
                  编号：{instance.instanceCode}
                </Typography>
              </Stack>
            )}
          </Box>
          <StatusChip
            label={
              AssetInventoryStatusLabels[instance.status as keyof typeof AssetInventoryStatusLabels] ??
              instance.status
            }
            color={statusColor}
            size="small"
          />
        </InstanceCardHeader>
        <InstanceCardBody>
          {(instance.status === AssetInventoryStatus.RENTED) && instance.lessee && (
            <BoundUserRow>
              <Avatar src={instance.lessee.avatar || ''} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {instance.lessee.profile.realName || instance.lessee.username || '未绑定用户'}
                </Typography>
                {instance.lessee.phone && (
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {instance.lessee.phone}
                  </Typography>
                )}
              </Box>
              <HorizontalStack spacing={0.5}>
                <Iconify icon="solar:clock-circle-bold" width={18} />
                <Typography variant="caption" color="text.secondary">{fDate(instance.boundAt)}</Typography>
              </HorizontalStack>
            </BoundUserRow>
          )}
        </InstanceCardBody>
        <QuantityGrid sx={{ mt: 2 }}>
          {statItems.map(({ key, label, value }) => (
            <QuantityItem key={key}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="body2" fontWeight={700}>
                {value}
              </Typography>
            </QuantityItem>
          ))}
        </QuantityGrid>
        {
          instance.status !== AssetInventoryStatus.RENTED && (
            <>
              <Divider sx={{ my: 2, borderStyle: "dashed", mx: -2 }} />
              <InventoryInstanceCardAction instance={instance} assetId={assetId} {...slotProps?.action} />
            </>
          )
        }
      </InstanceCardRoot>
    </Box>
  );
}
