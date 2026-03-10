import { ThumbsUp } from 'lucide-react';

import { Box, Stack, alpha, Typography, LinearProgress } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { FadeInBox } from 'src/components/custom';

import { ReviewSummaryRoot, ReviewScoreDisplay } from '../styled';

// ----------------------------------------------------------------------

type Props = {
  reviewCount: number;
  avgScore: number;
  scoreDistribution: Record<string, number>;
};

const STARS = [5, 4, 3, 2, 1] as const;

export function ReviewSummaryCard({ reviewCount, avgScore, scoreDistribution }: Props) {
  const maxCount = Math.max(...STARS.map((s) => scoreDistribution[String(s)] ?? 0), 1);
  const goodPercent =
    reviewCount > 0
      ? Math.round(
          (((scoreDistribution['5'] ?? 0) + (scoreDistribution['4'] ?? 0)) / reviewCount) * 100
        )
      : 100;

  return (
    <FadeInBox>
      <ReviewSummaryRoot>
        <Stack direction="row" spacing={3} alignItems="stretch">
          <Stack alignItems="center" spacing={1.5} sx={{ minWidth: 100 }}>
            <ReviewScoreDisplay>{avgScore.toFixed(1)}</ReviewScoreDisplay>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              flexWrap="wrap"
              justifyContent="center"
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <Iconify
                  key={s}
                  sx={{
                    color: 'warning.main',
                    opacity: s <= Math.round(avgScore) ? 1 : 0.25,
                  }}
                  icon={s <= Math.round(avgScore) ? 'eva:star-fill' : 'eva:star-fill'}
                />
              ))}
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {reviewCount} 条真实评价
            </Typography>
            {goodPercent >= 90 && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
                  color: 'success.dark',
                }}
              >
                <ThumbsUp size={12} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {goodPercent}% 好评
                </Typography>
              </Stack>
            )}
          </Stack>

          <Box sx={{ flex: 1, py: 0.5, minWidth: 0 }}>
            <Stack spacing={1.25}>
              {STARS.map((star) => {
                const count = scoreDistribution[String(star)] ?? 0;
                const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const isGood = star >= 4;
                return (
                  <Stack key={star} direction="row" alignItems="center" spacing={1.5}>
                    <Typography
                      variant="caption"
                      sx={{
                        width: 24,
                        fontWeight: 700,
                        color: isGood
                          ? 'success.main'
                          : star === 3
                            ? 'warning.main'
                            : 'text.secondary',
                      }}
                    >
                      {star}星
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      sx={{
                        flex: 1,
                        height: 10,
                        borderRadius: 2,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.15),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          bgcolor: isGood
                            ? 'success.main'
                            : star === 3
                              ? 'warning.main'
                              : 'grey.500',
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ width: 32, fontWeight: 600, color: 'text.secondary' }}
                    >
                      {count}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </ReviewSummaryRoot>
    </FadeInBox>
  );
}
