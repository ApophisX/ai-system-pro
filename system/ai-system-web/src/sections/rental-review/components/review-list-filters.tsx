import type { ReviewScoreRange } from '../types';

import { Stack } from '@mui/material';

import { ReviewFilterChip } from '../styled';
import { REVIEW_SCORE_RANGE_OPTIONS } from '../types';

// ----------------------------------------------------------------------

type Props = {
  value: ReviewScoreRange;
  onChange: (value: ReviewScoreRange) => void;
};

export function ReviewListFilters({ value, onChange }: Props) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {REVIEW_SCORE_RANGE_OPTIONS.map((opt) => (
        <ReviewFilterChip
          key={opt.value}
          selected={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </ReviewFilterChip>
      ))}
    </Stack>
  );
}
