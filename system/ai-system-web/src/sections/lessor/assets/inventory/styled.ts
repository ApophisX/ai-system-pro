import { styled } from '@mui/material/styles';
import { Box, Card, Chip, Paper, Stack } from '@mui/material';

export const InstanceCardRoot = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  transition: 'box-shadow 0.25s ease, transform 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
}));

export const InstanceCardStatusBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 4,
  borderRadius: '4px 0 0 4px',
}));

export const InstanceCardHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
}));

export const InstanceCardBody = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.5),
}));

/** 绑定用户信息区块（仅绑定状态时展示） */
export const BoundUserRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

export const QuantityGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}));

export const QuantityItem = styled(Box)(({ theme }) => ({
  paddingBlock: theme.spacing(1.25),
  borderRadius: theme.spacing(1.5),
  textAlign: 'center',
  backgroundColor: theme.palette.action.hover,
}));

export const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  height: 28,
  '& .MuiChip-label': {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
}));

/** 详情页信息区块（标题 + 内容） */
export const DetailSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const DetailSectionTitle = styled(Box)(({ theme }) => ({
  ...theme.typography.subtitle2,
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

/** 详情页区块卡片（白底/浅底、圆角、内边距） */
export const DetailBlockCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

/** 详情页信息行（label + value） */
export const DetailInfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1),
  '&:not(:last-child)': { borderBottom: `1px solid ${theme.palette.divider}` },
}));
