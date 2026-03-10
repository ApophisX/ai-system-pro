import type { UploadProps } from 'src/components/upload';

import Box from '@mui/material/Box';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type IdCardUploadProps = Omit<UploadProps, 'placeholder'> & {
  name: string;
  placeholderImage: string;
};

export function IdCardUpload({ name, placeholderImage, sx, ...other }: IdCardUploadProps) {
  return (
    <Field.Upload
      name={name}
      placeholder={<IdCardPlaceholder image={placeholderImage} />}
      sx={{
        minHeight: { xs: 120, sm: 160, md: 280 },
        height: { xs: 120, sm: 160, md: 280 },
        ...sx,
      }}
      {...other}
    />
  );
}

// ----------------------------------------------------------------------

type IdCardPlaceholderProps = {
  image: string;
};

function IdCardPlaceholder({ image }: IdCardPlaceholderProps) {
  return (
    <Box
      position="relative"
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Image src={image} sx={{ width: { xs: 120, sm: 160, md: 280 } }} />
      <Iconify
        icon="solar:camera-add-bold"
        sx={{
          position: 'absolute',
          top: '50%',
          right: '50%',
          width: 24,
          height: 24,
          transform: 'translate(50%, -50%)',
          zIndex: 10,
          color: 'black',
        }}
      />
    </Box>
  );
}
