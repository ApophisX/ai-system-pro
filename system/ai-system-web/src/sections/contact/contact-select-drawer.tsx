import type { DrawerProps } from '@mui/material';
import type { DialogProps } from '@toolpad/core/useDialogs';

import { useCallback } from 'react';

import { Stack, Drawer, Divider, IconButton, Typography, useMediaQuery } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { ContactListContent } from './contact-list-content';

type ContactSelectDrawerPayload =
  | {
      drawerProps?: DrawerProps;
      data?: MyApi.OutputContactDto | null;
    }
  | undefined;

export function ContactSelectDrawer({
  open,
  onClose,
  payload = {},
}: DialogProps<ContactSelectDrawerPayload, MyApi.OutputContactDto | null>) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const { data, drawerProps } = payload;

  const handleClose = useCallback(() => {
    onClose(null);
  }, [onClose]);

  const handleSelect = useCallback(
    (contact: MyApi.OutputContactDto) => {
      onClose(contact);
    },
    [onClose]
  );

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor={isMobile ? 'bottom' : 'right'}
      {...drawerProps}
    >
      <Stack
        sx={{
          height: isMobile ? '80vh' : '100vh',
          width: isMobile ? '100%' : '50vw',
          overflow: 'hidden',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
          <Typography variant="h6">选择联系人</Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
        <Divider />
        <ContactListContent onSelect={handleSelect} checkedId={data?.id} />
      </Stack>
    </Drawer>
  );
}
