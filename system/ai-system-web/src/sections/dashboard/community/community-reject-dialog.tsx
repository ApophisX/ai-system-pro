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

type CommunityRejectDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (auditRemark: string) => void | Promise<void>;
  loading?: boolean;
  communityName?: string;
};

export function CommunityRejectDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  communityName,
}: CommunityRejectDialogProps) {
  const [auditRemark, setAuditRemark] = useState('');

  const handleClose = useCallback(() => {
    if (!loading) {
      setAuditRemark('');
      onClose();
    }
  }, [loading, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!auditRemark.trim()) return;
    await onSubmit(auditRemark.trim());
    setAuditRemark('');
    onClose();
  }, [auditRemark, onSubmit, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>拒绝社区审核</DialogTitle>
      <DialogContent>
        {communityName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            社区：{communityName}
          </Typography>
        )}
        <Stack sx={{ pt: 1 }}>
          <TextField
            label="审核意见（必填，将通知创建者）"
            placeholder="请输入拒绝原因，如：社区名称不符合规范"
            value={auditRemark}
            onChange={(e) => setAuditRemark(e.target.value)}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            disabled={loading}
            error={!!auditRemark && auditRemark.trim().length === 0}
            helperText={auditRemark && !auditRemark.trim() ? '审核意见不能为空' : undefined}
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
          disabled={loading || !auditRemark.trim()}
        >
          {loading ? '提交中...' : '确认拒绝'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
