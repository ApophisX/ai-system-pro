import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Avatar, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { MobileLayout } from 'src/components/custom/layout';
import { QrcodeImage } from 'src/components/custom/qrcode-image';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ShopCodeView() {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }
  return (
    <MobileLayout appTitle="二维码" containerProps={{ maxWidth: 'md', sx: { py: 3 } }}>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          textAlign: 'center',
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'common.white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        <Stack alignItems="center" justifyContent="center" mb={3}>
          <Avatar
            src={user?.profile.avatar}
            alt={user?.username}
            variant="circular"
            sx={{
              width: 64,
              height: 64,
            }}
          />
          <Typography variant="h5" sx={{ color: '#fff' }}>
            {user?.username}的二维码
          </Typography>
        </Stack>

        {/* 二维码邀请码 */}
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
          <QrcodeImage value={`${paths.rental.shop(user?.id)}`} size={280} />
        </Box>
        <Typography variant="h5" sx={{ color: '#fff' }}>
          长按二维码，保存到相册
        </Typography>

        <Typography variant="body2" sx={{ color: '#fff' }}>
          可将二维码分享给好友，扫码后可浏览商品详情
        </Typography>
      </Paper>
    </MobileLayout>
  );
}
