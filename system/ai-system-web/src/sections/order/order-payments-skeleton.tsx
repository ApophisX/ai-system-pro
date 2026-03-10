import { Box, Paper, Stack, Divider, Skeleton } from '@mui/material';

// ----------------------------------------------------------------------

export function OrderPaymentsSkeleton() {
  return (
    <Stack spacing={2}>
      {/* 订单信息卡片骨架 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1.5 }} />
          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
          </Stack>
        </Stack>
      </Paper>

      {/* 支付总览骨架 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={100} height={24} />
        </Stack>
        <Stack spacing={1.5}>
          {[...Array(4)].map((_, index) => (
            <Stack key={index} direction="row" justifyContent="space-between">
              <Skeleton variant="text" width={80} height={20} />
              <Skeleton variant="text" width={100} height={20} />
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* 账单列表骨架 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={120} height={20} />
        </Stack>
        <Stack spacing={2}>
          {[...Array(3)].map((_, index) => (
            <Paper
              key={index}
              sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Stack spacing={0.5}>
                      <Skeleton variant="text" width={80} height={20} />
                      <Skeleton variant="text" width={140} height={16} />
                    </Stack>
                  </Stack>
                  <Skeleton
                    variant="rectangular"
                    width={70}
                    height={24}
                    sx={{ borderRadius: 1.5 }}
                  />
                </Stack>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Stack spacing={1.5}>
                  {[...Array(3)].map((__, i) => (
                    <Stack key={i} direction="row" justifyContent="space-between">
                      <Skeleton variant="text" width={80} height={20} />
                      <Skeleton variant="text" width={100} height={20} />
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
