import { Box, Card, Chip, Stack, Paper, Button, Typography, CardContent } from '@mui/material';

import { fDateTime } from 'src/utils';

import { Iconify } from 'src/components/iconify';
import { MultiFilePreview } from 'src/components/upload';
import { HorizontalStack } from 'src/components/custom/layout';
import { StatusStamp, CurrencyTypography } from 'src/components/custom';

// ----------------------------------------------------------------------

type Item = MyApi.OutputDepositDeductionDto;

const STATUS_COLOR_MAP: Partial<
  Record<Item['status'], 'warning' | 'success' | 'error' | 'info' | 'default'>
> = {
  pending_user_confirm: 'info',
  pending_audit: 'warning',
  platform_approved: 'success',
  platform_rejected: 'error',
  executed: 'success',
  cancelled: 'default',
};

type DepositAuditCardProps = {
  item: Item;
  onApprove: (item: Item) => void;
  onReject: (item: Item) => void;
  loading?: boolean;
};

export function DepositAuditCard({ item, onApprove, onReject, loading }: DepositAuditCardProps) {
  const statusColor = STATUS_COLOR_MAP[item.status] ?? 'default';
  const isPendingAudit = item.status === 'pending_audit';
  const evidenceUrls = item.evidence?.urls ?? [];

  return (
    <Card
      sx={{
        overflow: 'hidden',
        position: 'relative',
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'border-color'], {
            duration: theme.transitions.duration.short,
          }),
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z8,
        },
      }}
    >
      <StatusStamp label={item.statusLabel} color={statusColor} size={60} right={8} top={8} />
      <CardContent sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          {/* 第一行：单号、订单号、状态、金额 */}
          <HorizontalStack
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
            spacing={1.5}
          >
            <HorizontalStack spacing={1.5} flexWrap="wrap">
              <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                扣除单号：{item.deductionNo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                订单号：{item.orderNo}
              </Typography>
            </HorizontalStack>
          </HorizontalStack>

          {/* 第二行：扣款原因、描述 */}
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{item.reason}</Typography>
            {item.description && (
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            )}
          </Stack>

          {/* 第三行：出租方、申请时间 */}
          <HorizontalStack
            flexWrap="wrap"
            justifyContent="space-between"
            spacing={2}
            sx={{ typography: 'caption', color: 'text.disabled' }}
          >
            {item.lessorName && (
              <HorizontalStack spacing={0.5}>
                <Iconify icon="solar:user-id-bold" width={14} />
                <span>
                  {item.lessorName} / {item.lessor.phone}
                </span>
              </HorizontalStack>
            )}
            <HorizontalStack spacing={0.5}>
              <Iconify icon="solar:calendar-date-bold" width={14} />
              <span>申请：{fDateTime(item.appliedAt)}</span>
            </HorizontalStack>
          </HorizontalStack>

          {/* 凭证图片 */}
          {evidenceUrls.length > 0 && <MultiFilePreview files={evidenceUrls} sx={{ mt: 0.5 }} />}

          {/* 用户响应信息（如有） */}
          {item.userResponseType && (
            <Paper variant="outlined" component={Stack} spacing={0.5} sx={{ p: 2 }}>
              <Box>
                <HorizontalStack justifyContent="space-between">
                  <HorizontalStack spacing={0.5}>
                    <Iconify icon="solar:user-rounded-bold" width={14} />
                    <Typography variant="caption" fontWeight={600}>
                      {item.lessee.username} / {item.lessee.phone}
                    </Typography>
                  </HorizontalStack>

                  <Chip
                    label={item.userResponseType === 'approved' ? '用户同意' : '用户拒绝'}
                    color={item.userResponseType === 'approved' ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: 0.5 }}
                  />
                </HorizontalStack>
                <Typography variant="caption" color="text.disabled">
                  {fDateTime(item.userRespondedAt)}
                </Typography>
              </Box>

              {item.userResponseDescription && (
                <Typography variant="body2" color="text.secondary">
                  {item.userResponseDescription}
                </Typography>
              )}

              {item.userResponseEvidence?.urls?.length ? (
                <MultiFilePreview files={item.userResponseEvidence.urls} />
              ) : null}
            </Paper>
          )}

          {/* 操作按钮：仅待审核显示 */}
          {isPendingAudit && (
            <HorizontalStack justifyContent="flex-end" spacing={1} sx={{ pt: 0.5 }}>
              <HorizontalStack spacing={1} alignItems="center">
                <CurrencyTypography
                  currency={item.amount}
                  color="error.main"
                  disableDivide
                  isNegative
                  fontSize={18}
                  slotProps={{
                    integer: {},
                  }}
                />
                <Chip
                  label={item.statusLabel}
                  color={statusColor}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </HorizontalStack>
              <Box flex={1} />
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onReject(item)}
                disabled={loading}
              >
                拒绝
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => onApprove(item)}
                disabled={loading}
              >
                通过
              </Button>
            </HorizontalStack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
