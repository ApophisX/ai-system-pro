import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState, useEffect } from 'react';

import { Box } from '@mui/material';

import { CONFIG } from 'src/global-config';

import { Image } from 'src/components/image';

type QrcodeImageProps = {
  value: string;
  size: number;
  imageSettings?: {
    src: string;
  };
};
export function QrcodeImage(props: QrcodeImageProps) {
  const { value, size = 280, imageSettings } = props;
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

  return (
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
          width: size,
          height: size,
          '& canvas': {
            borderRadius: 1.5,
            visibility: 'hidden',
          },
        }}
      >
        {qrcode && (
          <Image src={qrcode} alt="QRCode" sx={{ width: size, height: size, borderRadius: 1.5 }} />
        )}
        <QRCodeCanvas
          ref={qrcodeRef}
          value={value}
          size={size}
          level="H"
          marginSize={2}
          imageSettings={{
            src: imageSettings?.src ?? `${CONFIG.assetsDir}/logo/logo-single.png`,
            height: 40,
            width: 40,
            excavate: true,
          }}
        />
      </Box>
    </Box>
  );
}
