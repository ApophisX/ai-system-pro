import { styled } from '@mui/material/styles';
import { Box, Card, alpha, Stack, ListItem, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export const ScoreCardRoot = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
}));

export const ScoreCardOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
});

export const LevelBadge = styled(Box)({
  display: 'inline-block',
  padding: '4px 16px',
  borderRadius: 8,
  backgroundColor: 'rgba(255,255,255,0.2)',
  fontWeight: 700,
  fontSize: '0.875rem',
});

export const PrivilegeGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: 'repeat(3, 1fr)',
  // [theme.breakpoints.down('sm')]: {
  //   gridTemplateColumns: '1fr',
  // },
}));

export const PrivilegeCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'enabled',
})<{ enabled?: boolean }>(({ theme, enabled }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  borderColor: enabled ? theme.palette.primary.main : theme.palette.divider,
  backgroundColor: enabled ? alpha(theme.palette.primary.main, 0.1) : undefined,
}));

export const PrivilegeIconWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'enabled',
})<{ enabled?: boolean }>(({ theme, enabled }) => ({
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  marginBottom: theme.spacing(1),
  backgroundColor: enabled ? theme.palette.primary.lighter : theme.palette.background.neutral,
  color: enabled ? theme.palette.primary.main : theme.palette.text.secondary,
}));

export const ScoreDimCard = styled(Card)(({ theme }) => ({
  flex: 1,
  minWidth: 80,
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
}));

export const RecordItemRoot = styled(ListItem)(({ theme }) => ({
  paddingBlock: theme.spacing(2),
}));

export const RecordIconWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPositive',
})<{ isPositive?: boolean }>(({ theme, isPositive }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: isPositive ? theme.palette.success.lighter : theme.palette.error.lighter,
  color: isPositive ? theme.palette.success.main : theme.palette.error.main,
}));

export const EmptyStateRoot = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingBlock: theme.spacing(8),
  paddingInline: theme.spacing(2),
}));

export const EmptyIconWrap = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.neutral,
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  fontWeight: 700,
}));
