import type { DialogProps } from '@toolpad/core/useDialogs';
import type { ButtonProps, DialogProps as MuiDialogProps } from '@mui/material';

import { useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean } from 'minimal-shared/hooks';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
type ConfirmDialogProps =
  | {
      dialogProps?: MuiDialogProps;
      title?: any;
      content?: any;
      loadingText?: string;
      icon?: React.ReactNode;
      okButtonText?: string;
      cancelButtonText?: string;
      okButtonProps?: ButtonProps;
      useInfoIcon?: boolean;
      onOk?: () => Promise<void>;
      iconColor?:
        | 'primary.main'
        | 'secondary.main'
        | 'error.main'
        | 'warning.main'
        | 'info.main'
        | 'success.main';
    }
  | undefined;

export function MyConfirmDialog(props: DialogProps<ConfirmDialogProps, boolean>) {
  const { open, onClose, payload = {} } = props;
  const {
    title = '确定要删除吗',
    content = '删除后不可恢复，请谨慎操作！',
    loadingText = '处理中，请稍后...',
    icon,
    okButtonText = '确定',
    cancelButtonText = '取消',
    okButtonProps,
    iconColor = 'error.main',
    onOk,
    useInfoIcon = false,
  } = payload;

  const isLoading = useBoolean();

  const handleOnCancel = useCallback(() => {
    onClose(false);
  }, [onClose]);

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={isLoading.value ? undefined : onClose}
      {...payload.dialogProps}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: (theme) => varAlpha(theme.vars.palette.grey['800Channel'], 0.9),
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon || (
          <Iconify
            icon={useInfoIcon ? 'solar:info-circle-bold' : 'solar:danger-bold'}
            sx={{ width: 28, height: 28, color: iconColor }}
          />
        )}
        {title}
      </DialogTitle>

      {content && (
        <DialogContent sx={{ typography: 'body2' }}>
          {isLoading.value ? loadingText : content}
        </DialogContent>
      )}

      <DialogActions>
        <Button
          disabled={isLoading.value}
          variant="outlined"
          color="inherit"
          onClick={handleOnCancel}
        >
          {cancelButtonText}
        </Button>
        <Button
          loading={isLoading.value}
          variant="contained"
          color="error"
          {...okButtonProps}
          disabled={isLoading.value}
          onClick={() => {
            isLoading.onTrue();
            if (onOk) {
              onOk().finally(() => {
                onClose(true);
                isLoading.onFalse();
              });
            } else {
              onClose(true).finally(isLoading.onFalse);
            }
          }}
        >
          {okButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
