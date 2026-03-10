import { m } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState, useEffect } from 'react';
import { Store, Package, UserCheck, ShoppingBag } from 'lucide-react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

import { Image } from 'src/components/image';
import { toast } from 'src/components/snackbar';
import { CurrencyTypography } from 'src/components/custom';
import { HorizontalStack } from 'src/components/custom/layout';

// ----------------------------------------------------------------------

type MerchantInviteCodeCardProps = {
  data?: MyApi.OutputMyInviteCodeDto | null;
  loading?: boolean;
};

const INVITE_LINK_BASE =
  typeof window !== 'undefined' ? `${window.location.origin}/auth/jwt/sign-up` : '';

function formatInviteLink(code: string) {
  return `${INVITE_LINK_BASE}?inviteCode=${encodeURIComponent(code)}`;
}

// 加载中骨架屏
function LoadingSkeleton() {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        overflow: 'hidden',
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.4)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
      }}
    >
      <Stack spacing={3}>
        <Skeleton variant="rounded" height={200} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        <Skeleton
          variant="text"
          width="60%"
          height={40}
          sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
        />
        <Skeleton variant="rounded" height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      </Stack>
    </Card>
  );
}

function QrCodeBox({ inviteLink }: { inviteLink: string }) {
  const [qrCodeBlobUrl, setQrCodeBlobUrl] = useState<string>('');

  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (qrCodeRef.current) {
        qrCodeRef.current.toBlob((newBlob) => {
          if (newBlob) {
            const blobUrl = URL.createObjectURL(newBlob);
            setQrCodeBlobUrl(blobUrl);
          }
        });
      }
    }, 125);
  }, []);

  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: 280, height: 280, borderRadius: 1, overflow: 'hidden' }}>
        {qrCodeBlobUrl && (
          <Image
            src={qrCodeBlobUrl}
            alt="qrcode"
            sx={{ width: 280, height: 280, borderRadius: 1 }}
          />
        )}
        <QRCodeCanvas
          style={{ display: 'none' }}
          ref={qrCodeRef}
          value={inviteLink}
          size={280}
          marginSize={2}
          level="H"
          imageSettings={{
            src: `${CONFIG.assetsDir}/assets/icons/apps/ic-app-1.webp`,
            height: 44,
            width: 44,
            excavate: true,
            crossOrigin: 'anonymous',
          }}
        />
      </Box>
    </Stack>
  );
}

export function MerchantInviteCodeCard({ data, loading }: MerchantInviteCodeCardProps) {
  const inviteCode = data?.inviteCode ?? '';
  const inviteLink = inviteCode ? formatInviteLink(inviteCode) : '';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}已复制`);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{
        p: 3,
        borderRadius: 2,
        overflow: 'hidden',
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.535)} 50%, ${alpha(theme.palette.secondary.main, 0.6)} 100%)`,
        boxShadow: (theme) => theme.customShadows.z20,
        color: 'white',
      }}
    >
      <Stack spacing={3}>
        <Typography variant="h6" sx={{ fontWeight: 700, opacity: 0.95 }}>
          我的邀请码
        </Typography>

        <HorizontalStack
          sx={{
            justifyContent: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              letterSpacing: 3,
              fontWeight: 800,
              fontFamily: 'monospace',
            }}
          >
            {inviteCode || '—'}
          </Typography>
          {/* <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              variant="text"
              onClick={() => handleCopy(inviteCode, '邀请码')}
              sx={{ color: 'common.white', minWidth: 40 }}
            >
              <Copy size={20} />
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Share2 size={18} />}
              onClick={handleShare}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'common.white' },
              }}
            >
              分享
            </Button>
          </Box> */}
        </HorizontalStack>

        {inviteCode && <QrCodeBox inviteLink={inviteLink} />}

        {/* 统计概览 */}
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          {[
            { icon: UserCheck, label: '已邀请', value: data?.invitedCount ?? 0, color: 'info' },
            { icon: Store, label: '已认证', value: data?.verifiedCount ?? 0, color: 'warning' },
            { icon: Package, label: '已上架', value: data?.listedCount ?? 0, color: 'success' },
            {
              icon: ShoppingBag,
              label: '首单',
              value: data?.firstOrderCount ?? 0,
              color: 'primary',
            },
          ].map(({ icon: Icon, label, value }) => (
            <Box
              key={label}
              sx={{
                flex: '1 1 45%',
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                bgcolor: 'rgba(255,255,255,0.12)',
              }}
            >
              <Icon size={18} style={{ opacity: 0.9 }} />
              <Typography variant="caption" sx={{ opacity: 0.9, width: 40 }}>
                {label}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* 累计奖励 */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            累计奖励
          </Typography>
          <CurrencyTypography
            currency={9999}
            fontSize={18}
            slotProps={{
              prefix: { sx: { color: 'common.white' } },
              integer: { sx: { color: 'common.white', fontWeight: 700 } },
              decimal: { sx: { color: 'common.white' } },
            }}
          />
        </Stack>
      </Stack>
    </Card>
  );
}
