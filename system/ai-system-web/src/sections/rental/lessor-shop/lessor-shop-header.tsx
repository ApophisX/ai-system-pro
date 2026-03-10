import { m } from 'framer-motion';

import { Box, Stack, Avatar, Skeleton, IconButton, Typography, alpha } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// OutputOwnerBriefDto 来自资产列表项的 owner 字段

// ----------------------------------------------------------------------

interface LessorShopHeaderProps {
  owner?: MyApi.OutputOwnerBriefDto | null;
  loading?: boolean;
}

/**
 * 出租方店铺头部，展示出租方头像和名称
 * 承租方通过扫码/链接进入时显示
 */
export function LessorShopHeader({ owner, loading }: LessorShopHeaderProps) {
  const router = useRouter();
  if (loading) {
    return (
      <Box
        component={m.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'background.paper',
          borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
        }}
      >
        <Skeleton variant="circular" width={48} height={48} />
        <Stack spacing={0.5}>
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton variant="text" width={80} height={16} />
        </Stack>
      </Box>
    );
  }

  const displayName = owner?.nickname || owner?.username || '出租方';

  return (
    <Stack
      component={m.div}
      direction="row"
      alignItems="center"
      spacing={1}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: 'background.paper',
        borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
      }}
    >
      <Avatar
        src={owner?.avatar}
        alt={displayName}
        sx={{
          width: 48,
          height: 48,
          border: '2px solid',
          borderColor: 'divider',
        }}
      >
        {displayName?.charAt(0) || '?'}
      </Avatar>
      <Stack spacing={0.25} flexGrow={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {displayName}
        </Typography>
      </Stack>

      <IconButton
        component={m.button}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        color="primary"
        onClick={() => {
          router.replace('/');
        }}
      >
        <Iconify icon="solar:home-angle-bold-duotone" width={24} />
      </IconButton>
    </Stack>
  );
}
