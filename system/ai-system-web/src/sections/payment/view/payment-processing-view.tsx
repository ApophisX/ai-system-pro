import { m } from 'framer-motion';
import { useState, useEffect } from 'react';

import { Box, Stack, Button, Container, Typography, CircularProgress } from '@mui/material';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { MyAppBar } from 'src/components/custom/my-app-bar';

// ----------------------------------------------------------------------

type PaymentProcessingViewProps = {
  defaultRedirectUrl?: string;
  countdownSeconds?: number;
};

export function PaymentProcessingView({
  defaultRedirectUrl,
  countdownSeconds = 10,
}: PaymentProcessingViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(countdownSeconds);

  // 从 URL 参数或 props 获取跳转链接
  const redirectUrl =
    searchParams.get('redirect') || searchParams.get('returnUrl') || defaultRedirectUrl;
  const checkUrl = searchParams.get('check') || searchParams.get('checkUrl');

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

  // 如果有检查 URL，可以定期轮询支付状态
  useEffect(() => {
    if (!checkUrl) return () => {};

    const checkInterval = setInterval(async () => {
      try {
        // 这里可以调用 API 检查支付状态
        // const response = await checkPaymentStatus(checkUrl);
        // if (response.status === 'success') {
        //   router.replace(redirectUrl || paths.payment.success);
        // } else if (response.status === 'failed') {
        //   router.replace(paths.payment.failure);
        // }
      } catch (error) {
        console.error('Check payment status error:', error);
      }
    }, 3000); // 每 3 秒检查一次

    return () => clearInterval(checkInterval);
  }, [checkUrl, redirectUrl, router]);

  const handleGoNow = () => {
    if (redirectUrl) {
      router.replace(redirectUrl);
    } else {
      router.back();
    }
  };

  return (
    <Box sx={{ pb: 5, bgcolor: 'background.neutral', minHeight: '100vh' }}>
      <MyAppBar appTitle="支付处理中" />

      <Container sx={{ py: 4 }}>
        <Stack spacing={4} alignItems="center">
          {/* 加载动画 */}
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
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: 'primary.main',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:wad-of-money-bold" width={40} sx={{ color: 'primary.main' }} />
            </Box>
            {/* 外圈动画 */}
            <Box
              component={m.div}
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'primary.main',
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
              支付处理中
            </Typography>
            <Typography
              component={m.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              variant="body2"
              sx={{ color: 'text.secondary', maxWidth: 300 }}
            >
              正在处理您的支付请求，请稍候...
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
