import type { IconifyName } from 'src/components/iconify';

import { m } from 'framer-motion';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Card,
  Stack,
  alpha,
  Button,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import API from 'src/services/API';
import { fDateTime } from 'src/utils';

import { toast } from 'src/components/snackbar';
import { CurrencyTypography } from 'src/components/custom';
import { MobileLayout } from 'src/components/custom/layout';
import { Iconify, withdrawIcons } from 'src/components/iconify';

// ----------------------------------------------------------------------

function getStatusConfig(status: string) {
  const { pending, reviewing, wallet, completed, rejected, fileText } = withdrawIcons;
  const map: Record<string, { label: string; color: string; icon: IconifyName }> = {
    pending: { label: '待审核', color: 'warning.main', icon: pending },
    reviewing: { label: '审核中', color: 'info.main', icon: reviewing },
    approved: { label: '待打款', color: 'info.main', icon: wallet },
    processing: { label: '打款中', color: 'info.main', icon: wallet },
    completed: { label: '已完成', color: 'success.main', icon: completed },
    rejected: { label: '已拒绝', color: 'error.main', icon: rejected },
    failed: { label: '打款失败', color: 'error.main', icon: rejected },
    canceled: { label: '已取消', color: 'text.disabled', icon: rejected },
  };
  return map[status] ?? { label: status, color: 'text.secondary', icon: fileText };
}

const CANCELABLE_STATUSES = ['pending', 'reviewing'];

export default function LessorWithdrawDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: withdraw,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['lessor-withdraw-detail', id],
    queryFn: () => API.AppWithdraw.AppWithdrawControllerGetByIdV1({ id: id! }),
    enabled: !!id,
    select: (res) => res?.data?.data,
  });

  const cancelMutation = useMutation({
    mutationFn: () => API.AppWithdraw.AppWithdrawControllerCancelV1({ id: id! }),
    onSuccess: () => {
      toast.success('已取消提现申请');
      queryClient.invalidateQueries({ queryKey: ['lessor-withdraw-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['lessor-withdraw-list'] });
      queryClient.invalidateQueries({ queryKey: ['lessor-withdraw-account'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || '取消失败');
    },
  });

  if (!id) {
    navigate(paths.lessor.withdraw.root);
    return null;
  }

  if (isPending) {
    return (
      <MobileLayout appTitle="提现详情">
        <Stack sx={{ p: 3 }} alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            加载中...
          </Typography>
        </Stack>
      </MobileLayout>
    );
  }

  if (isError || !withdraw) {
    return (
      <MobileLayout appTitle="提现详情">
        <Stack sx={{ p: 3 }} alignItems="center" spacing={2}>
          <Iconify icon={withdrawIcons.danger} width={48} sx={{ color: 'error.main' }} />
          <Typography variant="body1">加载失败或提现单不存在</Typography>
          <Button variant="contained" onClick={() => navigate(paths.lessor.withdraw.root)}>
            返回列表
          </Button>
        </Stack>
      </MobileLayout>
    );
  }

  const amount = Number.parseFloat(withdraw.amount) || 0;
  const fee = Number.parseFloat(withdraw.fee ?? '0') || 0;
  const actualAmount = Number.parseFloat(withdraw.actualAmount ?? '0') || amount - fee;
  const config = getStatusConfig(withdraw.status);

  const canCancel = CANCELABLE_STATUSES.includes(withdraw.status);

  return (
    <MobileLayout appTitle="提现详情" containerProps={{ sx: { pb: 4 } }}>
      <Stack sx={{ p: 2 }} spacing={3}>
        <Card
          sx={{
            p: 3,
            textAlign: 'center',
            background: (theme) =>
              `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 100%)`,
          }}
          component={m.div}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => {
                const [key] = config.color.split('.');
                const paletteKey = key as 'success' | 'error' | 'warning' | 'info';
                return alpha(theme.palette[paletteKey]?.main ?? theme.palette.primary.main, 0.15);
              },
              color: config.color,
            }}
          >
            <Iconify icon={config.icon} width={32} />
          </Box>
          <Typography variant="overline" color="text.secondary">
            {config.label}
          </Typography>
          <CurrencyTypography currency={amount} fontSize={32} />
          {fee > 0 && (
            <Typography variant="caption" color="text.secondary">
              手续费 ¥{fee.toFixed(2)}，实际到账 ¥{actualAmount.toFixed(2)}
            </Typography>
          )}
        </Card>

        <Card
          sx={{ overflow: 'hidden' }}
          component={m.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Stack divider={<Divider />}>
            <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                提现单号
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {withdraw.withdrawNo}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                提现方式
              </Typography>
              <Typography variant="body2">
                {withdraw.withdrawChannel === 'wechat'
                  ? '微信'
                  : withdraw.withdrawChannel === 'alipay'
                    ? '支付宝'
                    : '银行卡'}
              </Typography>
            </Stack>
            {withdraw.bankBranchAddress && (
              <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  开户行
                </Typography>
                <Typography variant="body2">{withdraw.bankBranchAddress}</Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                申请时间
              </Typography>
              <Typography variant="body2">{fDateTime(withdraw.requestedAt)}</Typography>
            </Stack>
            {withdraw.reviewedAt && (
              <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  审核时间
                </Typography>
                <Typography variant="body2">{fDateTime(withdraw.reviewedAt)}</Typography>
              </Stack>
            )}
            {withdraw.completedAt && (
              <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  完成时间
                </Typography>
                <Typography variant="body2">{fDateTime(withdraw.completedAt)}</Typography>
              </Stack>
            )}
            {(withdraw.failedReason || withdraw.rejectReason) && (
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ p: 2 }}
                alignItems="flex-start"
              >
                <Typography variant="body2" color="text.secondary">
                  {withdraw.status === 'rejected' ? '拒绝原因' : '失败原因'}
                </Typography>
                <Typography
                  variant="body2"
                  color="error.main"
                  sx={{ maxWidth: '60%', textAlign: 'right' }}
                >
                  {withdraw.failedReason || withdraw.rejectReason}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Card>

        {canCancel && (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? '取消中...' : '撤销提现申请'}
          </Button>
        )}

        <Stack direction="row" spacing={2}>
          <Button fullWidth variant="outlined" onClick={() => navigate(paths.lessor.withdraw.root)}>
            返回列表
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate(paths.lessor.withdraw.apply)}
          >
            再次提现
          </Button>
        </Stack>
      </Stack>
    </MobileLayout>
  );
}
