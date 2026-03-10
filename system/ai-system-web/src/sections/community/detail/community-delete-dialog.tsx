import type { DialogProps } from '@toolpad/core/useDialogs';

import { useState, useCallback } from 'react';

import {
  Stack,
  Dialog,
  Button,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import API from 'src/services/API';

import { toast } from 'src/components/snackbar';

type CommunityDeleteDialogPayload = {
  id: string;
  communityName?: string;
  onSuccess?: () => void;
};

/** 创建者删除社区确认弹窗（useDialogs） */
export function CommunityDeleteDialog(props: DialogProps<CommunityDeleteDialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { id, communityName, onSuccess } = payload || {};

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => {
    if (!loading) {
      setReason('');
      onClose?.();
    }
  }, [loading, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      await API.AppCommunity.AppCommunityControllerDeleteV1({ id });
      toast.success('社区已删除');
      onSuccess?.();
      setReason('');
      onClose?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    } finally {
      setLoading(false);
    }
  }, [id, onSuccess, onClose]);

  if (!id) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>删除社区</DialogTitle>
      <DialogContent>
        {communityName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            社区：{communityName}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          删除后，社区将不再接受新成员，已有成员仍可浏览社区内商品。
        </Typography>
        <Stack sx={{ pt: 1 }}>
          <TextField
            label="删除原因（选填）"
            placeholder="请输入删除原因"
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
          {loading ? '提交中...' : '确认删除'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
