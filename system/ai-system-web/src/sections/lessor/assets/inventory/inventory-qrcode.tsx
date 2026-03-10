import { QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Image } from 'src/components/image';

import { DetailBlockCard, DetailSectionTitle } from './styled';

// ----------------------------------------------------------------------

const getInstanceDetailUrl = (assetId: string, inventoryCode: string) => {
  if (typeof window === 'undefined') return '';
  const path = `${paths.rental.goods.detail(assetId)}?inventoryCode=${inventoryCode}`;
  return path;
  // return `${window.location.origin}${path}`;
};

// ----------------------------------------------------------------------

type InventoryQrcodeProps = {
  assetId: string;
  instanceId: string;
  inventoryCode: string;
};

/**
 * 实例二维码组件
 * 展示资产实例的二维码，扫码可跳转至实例详情页
 */
export function InventoryQrcode({ assetId, inventoryCode }: InventoryQrcodeProps) {
  const url = getInstanceDetailUrl(assetId, inventoryCode);
  // const url = inventoryCode;
  const [qrcode, setQrcode] = useState<string>('');
  const qrcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (qrcodeRef.current) {
        qrcodeRef.current.toBlob((blob) => {
          if (blob) {
            setQrcode(URL.createObjectURL(blob));
          }
        });
      }
    }, 150);
  }, []);

  if (!url) return null;

  return (
    <DetailBlockCard sx={{ mb: 2 }}>
      <DetailSectionTitle sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
        <QrCode size={18} />
        实例二维码
      </DetailSectionTitle>
      <Stack alignItems="center" spacing={1.5}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              overflow: 'hidden',
              width: 200,
              height: 200,
              '& canvas': {
                visibility: 'hidden',
              },
            }}
          >
            {qrcode && (
              <Image
                src={qrcode}
                alt="QRCode"
                sx={{ width: 200, height: 200, borderRadius: 1.5 }}
              />
            )}
            <QRCodeCanvas
              ref={qrcodeRef}
              value={url}
              size={200}
              marginSize={2}
              level="H"
              imageSettings={{
                src: `${CONFIG.assetsDir}/logo/logo-single.png`,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </Box>
        </Box>
        {inventoryCode && (
          <Typography variant="caption" color="text.disabled">
            编号：{inventoryCode}
          </Typography>
        )}
        <Typography variant="body2" color="text.disabled">
          可将二维码分享给客户，扫码即可发起租赁
        </Typography>
      </Stack>
    </DetailBlockCard>
  );
}
