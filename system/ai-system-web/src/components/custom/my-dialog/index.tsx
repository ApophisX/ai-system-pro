import type { ButtonProps, DialogProps as MDialogProps } from '@mui/material';

import {
  Stack,
  Dialog,
  Button,
  Divider,
  Typography,
  DialogTitle,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import DialogCloseIcon from './dialog-close-icon';

export type MyDialogProps = {
  children: React.ReactNode;
  dialogTitle: string;
  loading?: boolean;
  okButtonText?: string;
  cancelButtonText?: string;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  showActionButtons?: boolean;
} & MDialogProps;

export function MyDialog({
  dialogTitle,
  children,
  loading,
  okButtonProps,
  cancelButtonProps,
  okButtonText = '确定',
  cancelButtonText = '取消',
  showActionButtons = true,
  ...dialogProps
}: MyDialogProps) {
  const onClose = () => {
    dialogProps.onClose?.({}, 'backdropClick');
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      fullScreen={false}
      slotProps={{
        paper: {
          sx: {
            border: (theme) => `1px solid ${theme.vars.palette.shared.paperOutlined}`,
          },
        },
        ...dialogProps.slotProps,
      }}
      {...dialogProps}
    >
      <DialogCloseIcon onClose={onClose} />
      <DialogTitle>
        <Stack direction="row">
          <Typography variant="h4">{dialogTitle}</Typography>
        </Stack>
      </DialogTitle>
      <Divider sx={{ borderStyle: 'dashed' }} />
      {loading ? (
        <Stack sx={{ minHeight: 350 }} justifyContent="center" alignItems="center">
          <CircularProgress />
          <Typography sx={{ mt: 2 }} variant="body2">
            加载中...
          </Typography>
        </Stack>
      ) : (
        children
      )}
      {showActionButtons && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <DialogActions>
            <Button variant="soft" onClick={onClose} {...cancelButtonProps}>
              {cancelButtonText}
            </Button>
            <Button variant="contained" {...okButtonProps}>
              {okButtonText}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
