import type { DrawerProps } from '@mui/material';
import type { DialogProps } from '@toolpad/core/useDialogs';

import { useCallback } from 'react';

import { Stack, Drawer, Divider, IconButton, Typography, useMediaQuery } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { NewEditContactFormContent } from './new-edit-contact-form-content';

type ContactSelectDrawerPayload = {
  drawerProps?: DrawerProps;
  data?: MyApi.OutputContactDto;
};

export function NewEditContactDrawer({
  open,
  onClose,
  payload,
}: DialogProps<ContactSelectDrawerPayload, boolean>) {
  const { data } = payload;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const handleClose = useCallback(() => {
    onClose(false);
  }, [onClose]);

  return (
    <Drawer open={open} onClose={handleClose} anchor={isMobile ? 'bottom' : 'right'}>
      <Stack
        sx={{
          height: isMobile ? '80vh' : '100vh',
          width: isMobile ? '100%' : '50vw',
          overflow: 'hidden',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
          <Typography variant="h6">{data ? '编辑联系人' : '新增联系人'}</Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
        <Divider />
        <Scrollbar sx={{ flex: 1, px: 3, pt: 2, pb: 14 }}>
          <NewEditContactFormContent
            formData={data}
            onSuccess={() => {
              onClose(true);
            }}
          />
        </Scrollbar>
      </Stack>
    </Drawer>
  );
}
