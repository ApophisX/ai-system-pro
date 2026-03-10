import { Box, Paper, Stack, Divider, Skeleton } from '@mui/material';

// ----------------------------------------------------------------------

export function LessorOrderDetailSkeleton() {
  return (
    <Stack spacing={2}>
      {/* 订单状态卡片骨架 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Skeleton variant="text" width={80} height={24} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1.5 }} />
        </Stack>
        <Skeleton variant="text" width="60%" height={20} />
      </Paper>

      {/* 租客信息卡片骨架 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={80} height={20} />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Skeleton variant="circular" width={48} height={48} />
          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
          </Stack>
        </Stack>
      </Paper>

      {/* 商品信息卡片骨架 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={80} height={20} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" width={100} height={100} sx={{ borderRadius: 1.5 }} />
          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="90%" height={24} />
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="60%" height={20} />
          </Stack>
        </Stack>

        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="text" width={80} height={20} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="text" width={80} height={20} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="text" width={80} height={20} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={60} height={24} />
            <Skeleton variant="text" width={100} height={24} />
          </Stack>
        </Stack>
      </Paper>

      {/* 收货信息卡片骨架 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={80} height={20} />
        </Stack>
        <Stack spacing={1}>
          <Skeleton variant="text" width="50%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
        </Stack>
      </Paper>

      {/* 物流信息卡片骨架 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={80} height={20} />
        </Stack>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="text" width={100} height={20} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="text" width={150} height={20} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1.5 }} />
          </Stack>

          <Divider sx={{ my: 1 }} />

          {/* 时间线骨架 */}
          <Stack spacing={2}>
            {[...Array(3)].map((_, index) => (
              <Stack key={index} direction="row" spacing={2}>
                <Box sx={{ position: 'relative', pt: 0.5 }}>
                  <Skeleton variant="circular" width={10} height={10} />
                  {index < 2 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 2,
                        height: 40,
                        bgcolor: 'divider',
                      }}
                    />
                  )}
                </Box>
                <Stack spacing={0.5} sx={{ flexGrow: 1, pb: index < 2 ? 2 : 0 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* 订单时间卡片骨架 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={80} height={20} />
        </Stack>
        <Stack spacing={1.5}>
          {[...Array(5)].map((_, index) => (
            <Stack key={index} direction="row" justifyContent="space-between">
              <Skeleton variant="text" width={80} height={20} />
              <Skeleton variant="text" width={150} height={20} />
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* 备注信息卡片骨架 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={80} height={20} />
        </Stack>
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
      </Paper>

      {/* 底部按钮骨架 */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>
    </Stack>
  );
}



