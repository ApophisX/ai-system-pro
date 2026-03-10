import type { DialogProps } from '@toolpad/core/useDialogs';

import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import {
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type VerifyInviteCodeDialogPayload = {
  communityName?: string;
};

/** 验证邀请码弹框（加入私有社区时使用） */
export function VerifyInviteCodeDialog(
  props: DialogProps<VerifyInviteCodeDialogPayload, string | undefined>
) {
  const { open, onClose, payload = {} } = props;
  const { communityName } = payload;

  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  const handleClose = useCallback(() => {
    if (!open) return;
    setInviteCode('');
    setError('');
    onClose?.(undefined);
  }, [onClose, open]);

  const handleConfirm = useCallback(() => {
    const trimmed = inviteCode.trim();
    if (!trimmed) {
      setError('请输入邀请码');
      return;
    }
    setInviteCode('');
    setError('');
    onClose?.(trimmed);
  }, [inviteCode, onClose]);

  const handleInviteCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInviteCode(e.target.value);
      if (error) setError('');
    },
    [error]
  );

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={handleClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: (theme) => varAlpha(theme.vars.palette.grey['800Channel'], 0.9),
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        验证邀请码
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {communityName && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 1,
                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
              }}
            >
              <Iconify
                icon="solar:users-group-rounded-bold"
                width={20}
                sx={{ color: 'primary.main', mr: 1 }}
              />
              <span style={{ fontSize: 14, color: 'text.secondary' }}>{communityName}</span>
            </Stack>
          )}
          <TextField
            autoFocus
            fullWidth
            label="邀请码"
            placeholder="请输入社区邀请码"
            value={inviteCode}
            onChange={handleInviteCodeChange}
            error={!!error}
            helperText={error}
            slotProps={{
              input: {
                inputProps: { maxLength: 10 },
              },
            }}
            variant="outlined"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirm();
              }
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          取消
        </Button>
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          确认加入
        </Button>
      </DialogActions>
    </Dialog>
  );
}
