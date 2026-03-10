import type { UserRole } from 'src/sections/my/types';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { fDateTime } from 'src/utils';

import { ScoreCardRoot, ScoreCardOverlay, LevelBadge } from './credit-styled';

// ----------------------------------------------------------------------

const CREDIT_LEVEL_MAP: Record<string, string> = {
  AAA: '极好',
  AA: '优秀',
  A: '良好',
  B: '中等',
  C: '一般',
  D: '较差',
  E: '较差',
};

const CREDIT_SCORE_MIN = 300;
const CREDIT_SCORE_MAX = 950;

type Props = {
  account: MyApi.OutputCreditAccountDto | undefined;
  role: UserRole;
};

export function CreditScoreCard({ account, role }: Props) {
  const level = account?.creditLevel ? (CREDIT_LEVEL_MAP[account.creditLevel] ?? '一般') : null;
  const progressValue = account
    ? ((account.creditScore - CREDIT_SCORE_MIN) / (CREDIT_SCORE_MAX - CREDIT_SCORE_MIN)) * 100
    : 0;
  const isFrozen = account?.creditStatus === 'frozen';
  const roleLabel = role === 'lessee' ? '承租方' : '出租方';

  return (
    <Box
      component={m.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ScoreCardRoot>
        {isFrozen && (
          <ScoreCardOverlay>
            <Typography variant="h6" fontWeight="bold">
              信用已冻结
            </Typography>
          </ScoreCardOverlay>
        )}
        <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 1 }}>
          {roleLabel}信用分
        </Typography>
        <Typography variant="h1" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: 52, sm: 60 } }}>
          {account?.creditScore ?? 0}
        </Typography>
        {level && <LevelBadge>{level}</LevelBadge>}

        <Box sx={{ mt: 4, width: '100%' }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mb: 1, fontSize: 12, opacity: 0.8 }}
          >
            <span>{CREDIT_SCORE_MIN}</span>
            <span>{CREDIT_SCORE_MAX}</span>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progressValue))}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': { bgcolor: 'common.white' },
            }}
          />
          {account?.lastCalculatedAt && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
              评估时间：{fDateTime(account.lastCalculatedAt)}
            </Typography>
          )}
        </Box>
      </ScoreCardRoot>
    </Box>
  );
}
