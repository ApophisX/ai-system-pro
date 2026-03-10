import type { Slide } from 'yet-another-react-lightbox';

import { m } from 'framer-motion';
import { useMemo, useEffect } from 'react';

import { Box, Grid, Typography } from '@mui/material';

import { Image } from 'src/components/image';
import { MultiFilePreview } from 'src/components/upload';
import { Lightbox, useLightbox } from 'src/components/lightbox';

export function OrderEvidenceImageSection({ images }: { images: string[] }) {
  // 转换为 lightbox slides
  const slides = useMemo<Slide[]>(
    () =>
      images.map((url) => ({
        type: 'image',
        src: url,
      })),
    [images]
  );

  const lightbox = useLightbox(slides);

  // 同步 slides 到 lightbox
  useEffect(() => {
    lightbox.setSlides(slides);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides]);

  if (images.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
        凭证图片：
      </Typography>
      <MultiFilePreview files={images} />
    </Box>
  );
}
