import type { DialogProps } from '@toolpad/core/useDialogs';
import type { UserRole } from './types';

import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState, useEffect } from 'react';

import { Box, Stack, alpha, Typography } from '@mui/material';

import { CONFIG } from 'src/global-config';

import { Image } from 'src/components/image';
import { MyDialog } from 'src/components/custom/my-dialog';

// ----------------------------------------------------------------------

export type UserQrcodeDialogPayload = {
  userId?: string;
  username?: string;
  role: UserRole;
};

/**
 * 生成出租方二维码 URL
 * 承租方扫码后跳转至出租方店铺页，浏览其全部出租资产
 */
function getQrcodeUrl(role: UserRole, userId?: string): string {
  if (typeof window === 'undefined') return '';
  return '123456';
}

// ----------------------------------------------------------------------

export function UserQrcodeDialog({
  open,
  onClose,
  payload,
}: DialogProps<UserQrcodeDialogPayload, void>) {
  const { userId, username, role } = payload ?? {};
  const url = getQrcodeUrl(role, userId);
  const [qrcodeBlobUrl, setQrcodeBlobUrl] = useState<string>('');
  const qrcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open || !url) return () => {};
    const timer = setTimeout(() => {
      if (qrcodeRef.current) {
        qrcodeRef.current.toBlob((blob) => {
          if (blob) {
            setQrcodeBlobUrl(URL.createObjectURL(blob));
          }
        });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [open, url]);

  useEffect(() => {
    if (!open) {
      setQrcodeBlobUrl('');
    }
  }, [open]);

  if (!url) return null;

  return (
    <MyDialog
      open={open}
      onClose={() => {
        onClose?.();
      }}
      dialogTitle={username || '扫码查看出租商品'}
      showActionButtons={false}
      slotProps={{
        paper: {
          sx: { maxWidth: 360, mx: 2 },
        },
      }}
    >
      <Stack alignItems="center" spacing={2} sx={{ p: 3 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.grey[800], 0.5)
                : 'background.neutral',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              overflow: 'hidden',
              width: 220,
              height: 220,
              '& canvas': {
                borderRadius: 1.5,
                visibility: 'hidden',
              },
            }}
          >
            {qrcodeBlobUrl && (
              <Image
                src={qrcodeBlobUrl}
                alt="用户二维码"
                sx={{ width: 220, height: 220, borderRadius: 1.5 }}
              />
            )}
            <QRCodeCanvas
              ref={qrcodeRef}
              value={url}
              size={220}
              marginSize={2}
              level="H"
              imageSettings={{
                src: `${CONFIG.assetsDir}/logo/logo-single.png`,
                height: 28,
                width: 28,
                excavate: true,
              }}
            />
          </Box>
        </Box>

        {username && role === 'lessor' && (
          <Typography variant="body2" color="text.secondary">
            {username} 的二维码
          </Typography>
        )}

        <Typography variant="caption" color="text.disabled" textAlign="center" sx={{ px: 1 }}>
          扫码后可浏览您发布的租赁商品
        </Typography>
      </Stack>
    </MyDialog>
  );
}
