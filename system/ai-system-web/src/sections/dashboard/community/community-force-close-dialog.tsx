import { useState, useCallback } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from '@mui/material';

type CommunityForceCloseDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void | Promise<void>;
  loading?: boolean;
  communityName?: string;
};

export function CommunityForceCloseDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  communityName,
}: CommunityForceCloseDialogProps) {
  const [reason, setReason] = useState('');

  const handleClose = useCallback(() => {
    if (!loading) {
      setReason('');
      onClose();
    }
  }, [loading, onClose]);

  const handleSubmit = useCallback(async () => {
    await onSubmit(reason.trim());
    setReason('');
    onClose();
  }, [reason, onSubmit, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>强制关闭社区</DialogTitle>
      <DialogContent>
        {communityName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            社区：{communityName}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          关闭后，社区将不再接受新成员，已有成员仍可浏览社区内商品。
        </Typography>
        <Stack sx={{ pt: 1 }}>
          <TextField
            label="关闭原因（选填）"
            placeholder="请输入关闭原因，如：违规内容"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            disabled={loading}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          取消
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '提交中...' : '确认关闭'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
