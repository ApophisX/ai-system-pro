import { Card, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function ForbiddenCard() {
  return (
    <Card
      sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 2,
        bgcolor: (theme) => theme.palette.background.neutral,
      }}
    >
      <Iconify
        icon="solar:danger-triangle-bold"
        width={64}
        sx={{ color: 'text.disabled', mb: 2 }}
      />
      <Typography variant="h6" gutterBottom>
        暂无访问权限
      </Typography>
      <Typography variant="body2" color="text.secondary">
        商户邀请功能仅对平台拓展人员开放，如需开通请联系管理员。
      </Typography>
    </Card>
  );
}
