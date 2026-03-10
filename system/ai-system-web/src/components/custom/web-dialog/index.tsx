import type { DialogProps } from '@toolpad/core/useDialogs';
import type { MyDialogProps } from '../my-dialog';

import { useRef, useEffect, useCallback } from 'react';
import { useCountdownSeconds } from 'minimal-shared/hooks';

import { Box } from '@mui/material';

import { MyDialog } from '../my-dialog';

type Props = {
  dialogProps?: Partial<MyDialogProps>;
  webUrl: string;
  countdown?: number;
};
export function WebDialog(props: DialogProps<Props, boolean>) {
  const { payload, onClose, open } = props;
  const { dialogProps, webUrl, countdown: _countdown = 10 } = payload;
  const countdown = useCountdownSeconds(_countdown);
  const pushedRef = useRef(false);
  const ignoreNextPopRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeDialog = useCallback(
    (agreed: boolean) => {
      if (pushedRef.current) {
        ignoreNextPopRef.current = true;
        window.history.back();
      }
      onClose(agreed);
    },
    [onClose]
  );

  const handleClose = useCallback(() => {
    closeDialog(false);
  }, [closeDialog]);

  useEffect(() => {
    countdown.start();
  }, [countdown]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    if (!pushedRef.current) {
      pushedRef.current = true;
      const dialogId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.history.pushState(
        { __dialogType: 'web', __dialogId: dialogId },
        '',
        window.location.href
      );
    }

    const handlePopState = () => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
        return;
      }
      onCloseRef.current(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [open]);

  return (
    <MyDialog
      open={open}
      onClose={handleClose}
      dialogTitle=""
      okButtonText={countdown.value > 0 ? `同意(${countdown.value})` : '同意'}
      cancelButtonText="拒绝"
      fullScreen
      okButtonProps={{
        color: 'primary',
        onClick: () => {
          closeDialog(true);
        },
        disabled: countdown.value > 0,
      }}
      {...dialogProps}
    >
      <Box
        sx={{
          minHeight: '70vh',
          flex: 1,
          p: 0,
          '& iframe': {
            width: '100%',
            height: '100%',
            border: 'none',
            boxSizing: 'border-box',
            overflow: 'hidden',
          },
        }}
      >
        <iframe src={webUrl} />
      </Box>
    </MyDialog>
  );
}
