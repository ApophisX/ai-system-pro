import { Box, Card, Stack, Skeleton } from '@mui/material';

// ----------------------------------------------------------------------

export function CreditSkeleton() {
  return (
    <Stack spacing={3}>
      {/* 信用分卡片骨架 */}
      <Card
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        }}
      >
        <Skeleton
          variant="text"
          width={100}
          height={24}
          sx={{ mx: 'auto', mb: 1, bgcolor: 'rgba(255,255,255,0.3)' }}
        />
        <Skeleton
          variant="text"
          width={120}
          height={56}
          sx={{ mx: 'auto', mb: 2, bgcolor: 'rgba(255,255,255,0.3)' }}
        />
        <Skeleton
          variant="rounded"
          width={60}
          height={24}
          sx={{ mx: 'auto', mb: 3, bgcolor: 'rgba(255,255,255,0.3)' }}
        />
        <Skeleton
          variant="rounded"
          width="100%"
          height={8}
          sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
        />
      </Card>

      {/* 特权卡片骨架 - 一行三个 */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        }}
      >
        {[1, 2, 3].map((i) => (
          <Card key={i} variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
            <Skeleton variant="circular" width={44} height={44} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width="70%" height={20} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width="90%" height={16} sx={{ mx: 'auto' }} />
          </Card>
        ))}
      </Box>

      {/* 记录列表骨架 */}
      <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
          {[...Array(5)].map((_, i) => (
            <Stack
              key={i}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ py: 2, px: 2 }}
            >
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width={80} height={16} />
              </Box>
              <Skeleton variant="text" width={48} height={20} />
            </Stack>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
