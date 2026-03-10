import { m } from 'framer-motion';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ScoreDimCard } from './credit-styled';

type Props = {
  behaviorScore: number;
  riskScore: number;
  stabilityScore: number;
};

const DIMS = [
  { key: 'behaviorScore', label: '行为分', color: 'info' as const },
  { key: 'riskScore', label: '风险分', color: 'warning' as const },
  { key: 'stabilityScore', label: '稳定分', color: 'success' as const },
] as const;

export function LessorScoreCards({ behaviorScore, riskScore, stabilityScore }: Props) {
  const values = { behaviorScore, riskScore, stabilityScore };

  return (
    <Stack
      direction="row"
      spacing={2}
      component={m.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {DIMS.map(({ key, label, color }) => (
        <ScoreDimCard key={key} variant="outlined">
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: `${color}.main` }}>
            {values[key]}
          </Typography>
        </ScoreDimCard>
      ))}
    </Stack>
  );
}
