import type { ModalProps } from '@mui/material';

import { IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

type Props = {
  onClose?: () => void;
  closeDialog?: ModalProps['onClose'];
  disabled?: boolean;
};
export default function DialogCloseIcon({ onClose, disabled, closeDialog }: Props) {
  return (
    <IconButton
      disabled={disabled}
      tabIndex={-1}
      aria-label="close"
      onClick={
        closeDialog
          ? () => {
              closeDialog({}, 'backdropClick');
            }
          : onClose
      }
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
        zIndex: 9,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <Iconify icon="mingcute:close-line" />
    </IconButton>
  );
}
