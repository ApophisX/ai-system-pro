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

type EnterpriseRejectDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void | Promise<void>;
  loading?: boolean;
  enterpriseName?: string;
};

export function EnterpriseRejectDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  enterpriseName,
}: EnterpriseRejectDialogProps) {
  const [reason, setReason] = useState('');

  const handleClose = useCallback(() => {
    if (!loading) {
      setReason('');
      onClose();
    }
  }, [loading, onClose]);

  const handleSubmit = useCallback(async () => {
    await onSubmit(reason);
    setReason('');
    onClose();
  }, [reason, onSubmit, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>拒绝企业认证</DialogTitle>
      <DialogContent>
        {enterpriseName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            企业：{enterpriseName}
          </Typography>
        )}
        <Stack sx={{ pt: 1 }}>
          <TextField
            label="拒绝原因（选填，将通知用户）"
            placeholder="请输入拒绝原因"
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
        <Button variant="contained" color="error" onClick={handleSubmit} disabled={loading}>
          {loading ? '提交中...' : '确认拒绝'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
