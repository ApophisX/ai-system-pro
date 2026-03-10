import type { AdminRentalReviewListItem } from './types';

import { useMemo } from 'react';
import { m } from 'framer-motion';

import {
  Box,
  Card,
  Chip,
  alpha,
  Alert,
  Stack,
  Rating,
  Button,
  Typography,
  CardContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Image } from 'src/components/image';
import { MultiFilePreview } from 'src/components/upload';
import { HorizontalStack } from 'src/components/custom/layout';

// ----------------------------------------------------------------------

const STATUS_LABEL_MAP: Record<string, NonNullable<AdminRentalReviewListItem['status']>> = {
  待审核: 'pending',
  已通过: 'approved',
  已拒绝: 'rejected',
  已隐藏: 'hidden',
};

const STATUS_OPTIONS: Record<
  NonNullable<AdminRentalReviewListItem['status']>,
  { label: string; color: 'warning' | 'success' | 'error' | 'default' }
> = {
  pending: { label: '待审核', color: 'warning' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已拒绝', color: 'error' },
  hidden: { label: '已隐藏', color: 'default' },
};

type ReviewStatus = NonNullable<AdminRentalReviewListItem['status']>;

/** 从 status 或 statusLabel 解析出状态枚举 */
function resolveStatus(item: AdminRentalReviewListItem): ReviewStatus {
  if (item.status) return item.status;
  const mapped = item.statusLabel ? STATUS_LABEL_MAP[item.statusLabel] : undefined;
  return mapped ?? 'pending';
}

type AdminReviewCardProps = {
  item: AdminRentalReviewListItem;
  index: number;
  onApprove?: (item: AdminRentalReviewListItem) => void;
  onReject?: (item: AdminRentalReviewListItem) => void;
  onHide?: (item: AdminRentalReviewListItem) => void;
  loading?: boolean;
};

export function AdminReviewCard({
  item,
  index,
  onApprove,
  onReject,
  onHide,
  loading,
}: AdminReviewCardProps) {
  const router = useRouter();

  const status = resolveStatus(item);
  const statusOption = STATUS_OPTIONS[status];
  const score = item.score ?? 5;

  const canApprove = useMemo(() => status === 'pending', [status]);
  const canReject = useMemo(() => status === 'pending', [status]);
  const canHide = useMemo(() => status === 'approved', [status]);

  const nickname =
    item.lesseeNickname ?? item.lessee?.profile?.nickname ?? item.lessee?.username ?? '匿名用户';

  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const images = item.images ?? [];
  const asset = item.asset;

  const handleCardClick = () => {
    if (asset?.id) {
      router.push(paths.rental.goods.detail(asset.id));
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
        cursor: asset?.id ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z8,
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          {/* 头部：用户信息、评分、状态 */}
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
                {nickname.charAt(0)}
              </Box>
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {nickname}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
                  <Rating
                    value={score}
                    size="small"
                    readOnly
                    sx={{
                      '& .MuiRating-iconFilled': { color: 'warning.main' },
                      '& .MuiRating-iconEmpty': { color: 'warning.main', opacity: 0.3 },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {dateStr}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
            <Chip
              label={item.statusLabel ?? statusOption.label}
              size="small"
              color={statusOption.color}
              sx={{ height: 24, fontSize: 12, flexShrink: 0 }}
            />
          </Stack>

          {/* 评价内容 */}
          {item.content && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {item.content}
            </Typography>
          )}

          {/* 图片 */}
          {images.length > 0 && <MultiFilePreview files={images} />}

          {/* 关联资产 */}
          {asset && (
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
              <Image
                src={asset.coverImage}
                alt=""
                sx={{ width: 52, height: 52, borderRadius: 1.5, objectFit: 'cover' }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ flex: 1, fontWeight: 600 }}
              >
                {asset.name}
              </Typography>
            </Stack>
          )}

          {/* 商家回复 */}
          {item.replyContent && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
              }}
            >
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                商家回复
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 0.75, color: 'text.primary', lineHeight: 1.65 }}
              >
                {item.replyContent}
              </Typography>
            </Box>
          )}

          {/* 拒绝原因（已拒绝时展示） */}
          {status === 'rejected' && item.rejectReason && (
            <Alert severity="error" sx={{ py: 0.5 }}>
              <Typography variant="caption">拒绝原因：{item.rejectReason}</Typography>
            </Alert>
          )}

          {/* 操作按钮 */}
          {(canApprove || canReject || canHide) && (
            <HorizontalStack
              justifyContent="flex-end"
              spacing={1}
              onClick={(e) => e.stopPropagation()}
            >
              {canApprove && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject?.(item);
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
                      onApprove?.(item);
                    }}
                    disabled={loading}
                  >
                    通过
                  </Button>
                </>
              )}
              {canHide && (
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHide?.(item);
                  }}
                  disabled={loading}
                >
                  隐藏
                </Button>
              )}
            </HorizontalStack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
