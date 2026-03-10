import { Lock, Users, Package } from 'lucide-react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { fDateTime } from 'src/utils';

import { Iconify } from 'src/components/iconify';

type Item = MyApi.OutputCommunityDto;

type CommunityAuditCardProps = {
  item: Item;
  onApprove: (id: string) => void;
  onReject: (id: string, name?: string) => void;
  onForceClose: (id: string, name?: string) => void;
  loading?: boolean;
};

const STATUS_MAP: Record<
  Item['status'],
  { label: string; color: 'warning' | 'success' | 'error' | 'default' }
> = {
  pending: { label: '待审核', color: 'warning' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已拒绝', color: 'error' },
  closed: { label: '已关闭', color: 'default' },
};

const TYPE_MAP: Record<Item['type'], string> = {
  public: '公开',
  private: '私密',
};

export function CommunityAuditCard({
  item,
  onApprove,
  onReject,
  onForceClose,
  loading,
}: CommunityAuditCardProps) {
  const statusInfo = STATUS_MAP[item.status];
  const isPending = item.status === 'pending';
  const isApproved = item.status === 'approved';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          image={item.coverImage || ''}
          alt={item.name}
          sx={{
            height: 120,
            objectFit: 'contain',
            bgcolor: 'grey.200',
          }}
        />
        <Chip
          size="small"
          label={statusInfo.label}
          color={statusInfo.color}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        />
      </Box>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={0.5}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {item.name}
            </Typography>
            <Chip
              size="small"
              icon={item.type === 'private' ? <Lock size={12} /> : undefined}
              label={TYPE_MAP[item.type]}
              variant="outlined"
              sx={{ '& .MuiChip-icon': { color: 'inherit' } }}
            />
          </Stack>

          {item.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.description}
            </Typography>
          )}

          <Stack direction="row" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Users size={14} style={{ opacity: 0.7 }} />
              <Typography variant="caption" color="text.secondary">
                {item.memberCount ?? 0} 人
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Package size={14} style={{ opacity: 0.7 }} />
              <Typography variant="caption" color="text.secondary">
                {item.assetCount ?? 0} 件
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.disabled">
              创建时间：{item.createdAt ? fDateTime(item.createdAt) : '—'}
            </Typography>
            {item.auditAt && (
              <Typography variant="caption" color="text.disabled">
                审核时间：{fDateTime(item.auditAt)}
              </Typography>
            )}
            {item.auditRemark && (
              <Typography variant="caption" color="error.main">
                拒绝原因：{item.auditRemark}
              </Typography>
            )}
          </Stack>

          {isPending && (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 'auto', pt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onReject(item.id, item.name)}
                disabled={loading}
              >
                拒绝
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => onApprove(item.id)}
                disabled={loading}
                startIcon={<Iconify icon="eva:checkmark-fill" />}
              >
                通过
              </Button>
            </Stack>
          )}
          {isApproved && (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 'auto', pt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onForceClose(item.id, item.name)}
                disabled={loading}
                startIcon={<Iconify icon="solar:close-circle-bold" />}
              >
                强制关闭
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
