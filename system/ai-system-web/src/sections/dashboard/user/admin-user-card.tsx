import { m } from 'framer-motion';

import { Avatar, Card, Chip, Stack, Typography, CardContent } from '@mui/material';

import { fDateTime, fCurrency, fMobile } from 'src/utils';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Item = MyApi.OutputAdminUserListItemDto;

const STATUS_MAP: Record<
  Item['status'],
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  active: { label: '正常', color: 'success' },
  frozen: { label: '冻结', color: 'warning' },
  banned: { label: '封禁', color: 'error' },
};

const USER_TYPE_MAP: Record<Item['userType'], string> = {
  personal: '个人',
  enterprise: '企业',
};

const RISK_LEVEL_MAP: Record<
  Item['riskLevel'],
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  low: { label: '低', color: 'success' },
  medium: { label: '中', color: 'warning' },
  high: { label: '高', color: 'error' },
};

type AdminUserCardProps = {
  item: Item;
  index: number;
  onClick: (item: Item) => void;
};

export function AdminUserCard({ item, index, onClick }: AdminUserCardProps) {
  const profile = item.profile ?? {};
  const displayName = profile.nickname || profile.companyName || item.username || '—';
  const statusInfo = STATUS_MAP[item.status];
  const riskInfo = RISK_LEVEL_MAP[item.riskLevel];

  const availableBalanceYuan = (item.availableBalance ?? 0) / 100;

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'border-color'], {
            duration: theme.transitions.duration.short,
          }),
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z8,
        },
      }}
      onClick={() => onClick(item)}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2}>
          {/* 头部：头像 + 名称 + 状态 */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar src={item.avatar} alt={displayName} sx={{ width: 48, height: 48 }}>
              {displayName?.charAt(0) || '?'}
            </Avatar>
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                {displayName}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                <Chip label={USER_TYPE_MAP[item.userType]} size="small" variant="outlined" />
                <Chip
                  label={`${riskInfo.label}风险`}
                  color={riskInfo.color}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Stack>

          {/* 联系信息 */}
          <Stack spacing={0.5}>
            {(item.username || item.phone || item.email) && (
              <Typography variant="body2" color="text.secondary">
                账号：
                {[item.username, item.phone ? fMobile(item.phone) : '', item.email]
                  .filter(Boolean)
                  .join(' / ') || '—'}
              </Typography>
            )}
            {profile.companyName && (
              <Typography variant="body2" color="text.secondary">
                企业：{profile.companyName}
              </Typography>
            )}
          </Stack>

          {/* 信用与余额 */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="eva:star-fill" width={16} sx={{ color: 'warning.main' }} />
              <Typography variant="body2">信用 {item.creditScore}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              余额 {fCurrency(availableBalanceYuan)}
            </Typography>
          </Stack>

          {/* 时间 */}
          <Stack>
            <Typography variant="caption" color="text.disabled">
              注册：{item.createdAt ? fDateTime(item.createdAt) : '—'}
            </Typography>
            {item.lastLoginAt && (
              <Typography variant="caption" color="text.disabled">
                最后登录：{fDateTime(item.lastLoginAt)}
              </Typography>
            )}
          </Stack>

          {/* 点击提示 */}
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 'auto', pt: 1 }}>
            <Iconify icon="solar:eye-bold" width={16} sx={{ color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              点击查看详情
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
