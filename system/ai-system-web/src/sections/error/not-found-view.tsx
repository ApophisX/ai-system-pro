import wx from 'weixin-js-sdk';
import { m } from 'framer-motion';

import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { usePlatform } from 'src/hooks/use-platform';

import { SimpleLayout } from 'src/layouts/simple';
import { PageNotFoundIllustration } from 'src/assets/illustrations';

import { MobileLayout } from 'src/components/custom/layout';
import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export function NotFoundView() {
  const { isInWeChatMiniProgram } = usePlatform();
  const router = useRouter();

  const renderContent = (
    <>
      <m.div variants={varBounce('in')}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          抱歉，页面未找到！
        </Typography>
      </m.div>

      <m.div variants={varBounce('in')}>
        <Typography sx={{ color: 'text.secondary' }}>
          很抱歉，未能找到您要访问的页面。可能是链接地址错误或页面已被移除。请检查您的网络或稍后重试。
        </Typography>
      </m.div>

      <m.div variants={varBounce('in')}>
        <PageNotFoundIllustration sx={{ my: { xs: 5, sm: 10 } }} />
      </m.div>

      <Button
        component={RouterLink}
        size="large"
        variant="contained"
        onClick={() => {
          if (isInWeChatMiniProgram) {
            wx.miniProgram.navigateBack({
              url: '/pages/home/index',
            });
          } else {
            router.push('/');
          }
        }}
      >
        返回首页
      </Button>
    </>
  );

  if (isInWeChatMiniProgram) {
    return (
      <MobileLayout appTitle="页面未找到">
        <Stack
          component={MotionContainer}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            px: 0,
            py: 10,
          }}
        >
          {renderContent}
        </Stack>
      </MobileLayout>
    );
  }

  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <Container component={MotionContainer}>{renderContent}</Container>
    </SimpleLayout>
  );
}
