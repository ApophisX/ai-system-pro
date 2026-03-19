import type { UserRole } from './types';

import { Box } from '@mui/material';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// 按角色选择展示的统计卡片（兼容原有用法）
// ----------------------------------------------------------------------

interface StatsCardsProps {
  role: UserRole;
}

/** 根据 role 展示出租方或承租方统计卡片 */
export function StatsCards({ role }: StatsCardsProps) {
  return <Box>gird</Box>;
}
