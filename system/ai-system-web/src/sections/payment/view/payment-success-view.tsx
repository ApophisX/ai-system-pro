import { m } from 'framer-motion';
import { useState, useEffect } from 'react';

import { Box, Stack, Button, Container, Typography, CircularProgress } from '@mui/material';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { MyAppBar } from 'src/components/custom/my-app-bar';

// ----------------------------------------------------------------------

type PaymentSuccessViewProps = {
  defaultRedirectUrl?: string;
  countdownSeconds?: number;
};

export function PaymentSuccessView({
  defaultRedirectUrl,
  countdownSeconds = 5,
}: PaymentSuccessViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(countdownSeconds);

  // 从 URL 参数或 props 获取跳转链接
  const redirectUrl =
    searchParams.get('redirect') || searchParams.get('returnUrl') || defaultRedirectUrl;

  useEffect(() => {
    if (!redirectUrl) return () => {};

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace(redirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectUrl, router]);

  const handleGoNow = () => {
    if (redirectUrl) {
      router.replace(redirectUrl);
    } else {
      router.back();
    }
  };

  return (
    <Box sx={{ pb: 5, bgcolor: 'background.neutral', minHeight: '100vh' }}>
      <MyAppBar appTitle="支付成功" />

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
              <Iconify icon="solar:check-circle-bold" width={80} sx={{ color: 'success.main' }} />
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
              支付成功
            </Typography>
            <Typography
              component={m.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              variant="body2"
              sx={{ color: 'text.secondary', maxWidth: 300 }}
            >
              您的订单已成功支付，我们将尽快为您处理
            </Typography>
          </Stack>

          {/* 倒计时提示 */}
          {redirectUrl && countdown > 0 && (
            <Box
              component={m.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} thickness={4} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {countdown} 秒后自动跳转
                </Typography>
              </Stack>
            </Box>
          )}

          {/* 操作按钮 */}
          <Stack
            spacing={2}
            sx={{ width: '100%', maxWidth: 400, mt: 2 }}
            component={m.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {redirectUrl && (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleGoNow}
                startIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                sx={{
                  height: 48,
                  borderRadius: 2,
                  fontWeight: 'bold',
                }}
              >
                立即跳转
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => router.back()}
              sx={{
                height: 48,
                borderRadius: 2,
              }}
            >
              返回上一页
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
