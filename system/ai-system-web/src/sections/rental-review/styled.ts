import { styled } from '@mui/material/styles';
import { Box, Paper, alpha } from '@mui/material';

// ----------------------------------------------------------------------

export const ReviewSummaryRoot = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2.5),
  borderRadius: 16,
  overflow: 'hidden',
  position: 'relative',
  background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.lighter, 0.06)} 50%, ${alpha(theme.palette.success.main, 0.04)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
  boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 70%)`,
    borderRadius: '50%',
    pointerEvents: 'none',
  },
}));

export const ReviewScoreDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.common.white,
  fontSize: '2rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
  border: `3px solid ${alpha(theme.palette.common.white, 0.9)}`,
}));

export const ReviewFilterChip = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  padding: theme.spacing(0.875, 2),
  borderRadius: 24,
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(selected
    ? {
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: theme.palette.primary.contrastText,
        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
      }
    : {
        background:
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.grey[700], 0.3)
            : alpha(theme.palette.grey[500], 0.06),
        color: theme.palette.text.secondary,
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        '&:hover': {
          background:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.grey[600], 0.4)
              : alpha(theme.palette.primary.main, 0.08),
          borderColor: alpha(theme.palette.primary.main, 0.3),
          color: theme.palette.primary.main,
        },
      }),
}));

export const ReviewCardRoot = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5, 2.5),
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  // borderColor: alpha(theme.palette.primary.main, 0.25),
  boxShadow: `0 4px 12px ${alpha(theme.palette.grey[500], 0.12)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

export const ReviewImagesGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
  gap: theme.spacing(1.5),
}));

export const ReplyBlock = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 2),
  borderRadius: 12,
  marginTop: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.grey[500], 0.04)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
}));

export const SectionTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
  fontSize: '1.25rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
}));
