import { Card, Chip, Stack, Button, Typography, CardContent } from '@mui/material';

import { fDateTime } from 'src/utils';

import { Iconify } from 'src/components/iconify';
import { MultiFilePreview } from 'src/components/upload';

type Item = MyApi.OutputEnterpriseApplicationListItemDto;

type EnterpriseApplicationCardProps = {
  item: Item;
  onApprove: (userId: string) => void;
  onReject: (userId: string, companyName?: string) => void;
  onRevertToPending?: (userId: string) => void;
  loading?: boolean;
};

const STATUS_MAP: Record<
  Item['enterpriseVerificationStatus'],
  { label: string; color: 'warning' | 'success' | 'error' }
> = {
  pending: { label: '待审核', color: 'warning' },
  verified: { label: '已通过', color: 'success' },
  rejected: { label: '已拒绝', color: 'error' },
};

export function EnterpriseApplicationCard({
  item,
  onApprove,
  onReject,
  onRevertToPending,
  loading,
}: EnterpriseApplicationCardProps) {
  const profile = item.profile ?? {};
  const licenseUrls = (profile.businessLicensePhotoUrls ?? []).concat(
    item.profile.idCardPhotoUrls ?? []
  );

  const statusInfo = STATUS_MAP[item.enterpriseVerificationStatus];
  const isPending = item.enterpriseVerificationStatus === 'pending';
  const isVerified = item.enterpriseVerificationStatus === 'verified';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2}>
          {/* 头部：企业名 + 状态 */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {profile.companyName || item.username || '—'}
            </Typography>
            <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
          </Stack>

          {/* 联系信息 */}
          <Stack spacing={0.5}>
            {(item.username || item.phone || item.email) && (
              <Typography variant="body2" color="text.secondary">
                账号：
                {[item.username, item.phone, item.email].filter(Boolean).join(' / ') || '—'}
              </Typography>
            )}
            {profile.legalRepresentative && (
              <Typography variant="body2">法人：{profile.legalRepresentative}</Typography>
            )}
            {profile.companyAddress && (
              <Typography variant="body2" color="text.secondary">
                地址：{profile.companyAddress}
              </Typography>
            )}
            {(profile.companyPhone || profile.companyEmail) && (
              <Typography variant="body2" color="text.secondary">
                联系：
                {[profile.companyPhone, profile.companyEmail].filter(Boolean).join(' / ') || '—'}
              </Typography>
            )}
          </Stack>
          {/* 营业执照缩略图 */}
          <MultiFilePreview files={licenseUrls} />

          <Stack>
            <Typography variant="caption" color="text.disabled">
              申请时间：{item.createdAt ? fDateTime(item.createdAt) : '—'}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              审核时间：
              {item.enterpriseVerifiedAt ? fDateTime(item.enterpriseVerifiedAt) : '—'}
            </Typography>
          </Stack>

          {/* 操作按钮：待审核显示通过/拒绝，已通过显示恢复待审核 */}
          {isPending && (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 'auto', pt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onReject(item.id, profile.companyName)}
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
          {isVerified && onRevertToPending && (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 'auto', pt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={() => onRevertToPending(item.id)}
                disabled={loading}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                恢复待审核
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
