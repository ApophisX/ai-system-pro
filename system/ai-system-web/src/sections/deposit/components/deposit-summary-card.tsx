import { m } from 'framer-motion';

import { Box, Card, Stack, Skeleton, Typography } from '@mui/material';

import { fCurrency, fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type DepositSummaryCardProps = {
  summary: MyApi.OutputLesseeDepositSummaryDto | undefined;
  loading: boolean;
};

function CardSkeleton() {
  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'common.white',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows.primary,
      }}
    >
      <Stack spacing={1}>
        <Skeleton variant="text" width={120} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
        <Skeleton
          variant="text"
          width={160}
          height={48}
          sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}
        />
        <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i}>
              <Skeleton variant="text" width={60} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Skeleton variant="text" width={80} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
            </Box>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

export function DepositSummaryCard({ summary, loading }: DepositSummaryCardProps) {
  if (loading) {
    return <CardSkeleton />;
  }

  const frozenTotal = summary?.frozenDepositTotal ?? 0;
  const deductedTotal = summary?.deductedTotal ?? 0;
  const refundedTotal = summary?.refundedTotal ?? 0;

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      sx={{
        p: 3,
        mb: 3,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'common.white',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows.primary,
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
          当前冻结押金
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
          {fCurrency(frozenTotal)}
        </Typography>
        <Stack
          direction="row"
          spacing={3}
          sx={{ mt: 2, textAlign: 'center' }}
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
              当前已扣除总额
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {fCurrency(deductedTotal)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
              累计退还
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {fCurrency(refundedTotal)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
              涉及的订单数量
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              {fNumber(summary?.orderCount ?? 0)}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}
