import { m } from 'framer-motion';

import { Box, Stack, Button, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { MobileLayout } from 'src/components/custom/layout';

// ----------------------------------------------------------------------

type Props = {
  assetId: string;
};

export function ReportSuccessView({ assetId }: Props) {
  const router = useRouter();

  const handleBackToDetail = () => {
    router.replace(paths.rental.goods.detail(assetId));
  };

  const handleBackToHome = () => {
    router.replace(paths.home.root);
  };

  return (
    <MobileLayout appTitle="举报成功">
      <Box sx={{ pb: 5, minHeight: '100vh' }}>
        <Container sx={{ py: 4 }}>
          <Stack spacing={4} alignItems="center">
            {/* 成功图标动画 */}
            <Box
              component={m.div}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'success.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Box
                component={m.div}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Iconify
                  icon="solar:check-circle-bold"
                  width={80}
                  sx={{ color: 'success.main' }}
                />
              </Box>
              {/* 外圈动画 */}
              <Box
                component={m.div}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'success.main',
                }}
              />
            </Box>

            {/* 标题和描述 */}
            <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
              <Typography
                component={m.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                variant="h4"
                sx={{ fontWeight: 'bold' }}
              >
                举报已提交
              </Typography>
              <Typography
                component={m.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                variant="body2"
                sx={{ color: 'text.secondary', maxWidth: 320 }}
              >
                感谢您的反馈！我们会认真处理您的举报，处理结果将通过站内消息通知您。
              </Typography>
            </Stack>

            {/* 操作按钮 */}
            <Stack
              spacing={2}
              sx={{ width: '100%', maxWidth: 400, mt: 2 }}
              component={m.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleBackToDetail}
                startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                sx={{
                  height: 48,
                  borderRadius: 2,
                  fontWeight: 'bold',
                }}
              >
                返回商品详情
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleBackToHome}
                startIcon={<Iconify icon="solar:home-2-outline" />}
                sx={{
                  height: 48,
                  borderRadius: 2,
                }}
              >
                返回首页
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </MobileLayout>
  );
}
