import type { AdminReportListItem } from './types';

import { useMemo } from 'react';
import { m } from 'framer-motion';

import {
  Box,
  Card,
  Chip,
  alpha,
  Alert,
  Stack,
  Button,
  Typography,
  CardContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils';

import { MultiFilePreview } from 'src/components/upload';
import { HorizontalStack } from 'src/components/custom/layout';

import { REPORT_REASON_OPTIONS } from './constants';

// ----------------------------------------------------------------------

const STATUS_OPTIONS: Record<
  AdminReportListItem['status'],
  { label: string; color: 'warning' | 'success' | 'error' | 'default' }
> = {
  0: { label: '待处理', color: 'warning' },
  1: { label: '举报成立', color: 'success' },
  2: { label: '举报驳回', color: 'error' },
  3: { label: '自动关闭', color: 'default' },
};

function getReasonLabel(reason: string): string {
  const found = REPORT_REASON_OPTIONS.find((r) => r.value === reason);
  return found?.label ?? reason;
}

type AdminReportCardProps = {
  item: AdminReportListItem;
  index: number;
  onApprove?: (item: AdminReportListItem) => void;
  onReject?: (item: AdminReportListItem) => void;
  onMarkMalicious?: (item: AdminReportListItem) => void;
  loading?: boolean;
};

export function AdminReportCard({
  item,
  index,
  onApprove,
  onReject,
  onMarkMalicious,
  loading,
}: AdminReportCardProps) {
  const router = useRouter();

  const status = item.status;
  const statusOption = STATUS_OPTIONS[status];
  const canHandle = useMemo(() => status === 0, [status]);

  const reporterName = item.reporterNickname ?? `用户 ${item.reporterId?.slice(-6) ?? '-'}`;

  const images = (item.images ?? []).map((url) => (typeof url === 'string' ? url : ''));

  const handleCardClick = () => {
    if (item.assetId) {
      router.push(paths.rental.goods.detail(item.assetId));
    }
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
        cursor: item.assetId ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z8,
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          {/* 头部：举报人、时间、状态 */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="flex-start"
            justifyContent="space-between"
            flexWrap="wrap"
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'primary.main',
                }}
              >
                {reporterName.charAt(0)}
              </Box>
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {reporterName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {fDateTime(item.createdAt)}
                </Typography>
              </Stack>
            </Stack>
            <Chip
              label={statusOption.label}
              size="small"
              color={statusOption.color}
              sx={{ height: 24, fontSize: 12, flexShrink: 0 }}
            />
          </Stack>

          {/* 举报原因 */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              举报原因
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
              {getReasonLabel(item.reason)}
            </Typography>
          </Box>

          {/* 举报说明 */}
          {item.description && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {item.description}
            </Typography>
          )}

          {/* 举报图片 */}
          {images.length > 0 && <MultiFilePreview files={images} />}

          {/* 关联资产 */}
          {item.assetId && (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  资产
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ flex: 1, fontWeight: 600 }}
              >
                {item.assetName ?? `资产 ${item.assetId}`}
              </Typography>
            </Stack>
          )}

          {/* 处理结果（已处理时展示） */}
          {status !== 0 && item.handleResult && (
            <Alert
              severity={status === 1 ? 'success' : status === 2 ? 'error' : 'info'}
              sx={{ py: 0.5 }}
            >
              <Typography variant="caption">
                处理结果：{item.handleResult}
                {item.handledAt &&
                  ` · ${new Date(item.handledAt).toLocaleDateString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
              </Typography>
            </Alert>
          )}

          {/* 操作按钮：仅待处理状态可操作 */}
          {canHandle && (onApprove || onReject || onMarkMalicious) && (
            <HorizontalStack
              justifyContent="flex-end"
              spacing={1}
              flexWrap="wrap"
              onClick={(e) => e.stopPropagation()}
            >
              {onReject && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(item);
                  }}
                  disabled={loading}
                >
                  驳回
                </Button>
              )}
              {onMarkMalicious && (
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkMalicious(item);
                  }}
                  disabled={loading}
                >
                  恶意举报
                </Button>
              )}
              {onApprove && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(item);
                  }}
                  disabled={loading}
                >
                  举报成立
                </Button>
              )}
            </HorizontalStack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
