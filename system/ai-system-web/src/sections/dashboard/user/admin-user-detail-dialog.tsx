import { useState, useCallback } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Chip,
  Stack,
  Dialog,
  Button,
  Avatar,
  Divider,
  Skeleton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import API from 'src/services/API';
import { fMobile, fDateTime, fCurrency } from 'src/utils';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { MyConfirmDialog } from 'src/components/custom';
import { MultiFilePreview } from 'src/components/upload';
import { MyDialog } from 'src/components/custom/my-dialog';

import { EnterpriseRejectDialog } from 'src/sections/dashboard/enterprise/enterprise-reject-dialog';

// ----------------------------------------------------------------------

const STATUS_MAP: Record<
  MyApi.OutputUserDto['status'],
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  active: { label: '正常', color: 'success' },
  frozen: { label: '冻结', color: 'warning' },
  banned: { label: '封禁', color: 'error' },
};

const USER_TYPE_MAP: Record<MyApi.OutputUserDto['userType'], string> = {
  personal: '个人',
  enterprise: '企业',
};

const VERIFICATION_STATUS_MAP: Record<MyApi.OutputUserDto['verificationStatus'], string> = {
  unverified: '未认证',
  verified: '已认证',
  rejected: '已拒绝',
};

const ENTERPRISE_STATUS_MAP: Record<
  MyApi.OutputUserDto['enterpriseVerificationStatus'],
  { label: string; color: 'warning' | 'success' | 'error' }
> = {
  pending: { label: '待审核', color: 'warning' },
  verified: { label: '已通过', color: 'success' },
  rejected: { label: '已拒绝', color: 'error' },
};

const RISK_LEVEL_MAP: Record<
  MyApi.OutputUserDto['riskLevel'],
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  low: { label: '低', color: 'success' },
  medium: { label: '中', color: 'warning' },
  high: { label: '高', color: 'error' },
};

type AdminUserDetailDialogProps = {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AdminUserDetailDialog({
  open,
  userId,
  onClose,
  onSuccess,
}: AdminUserDetailDialogProps) {
  const queryClient = useQueryClient();
  const { open: confirm } = useDialogs();
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectDialog, setRejectDialog] = useState({ open: false });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    onSuccess?.();
  }, [queryClient, onSuccess]);

  const { data: user, isPending } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      const res = await API.AdminUser.AdminUserControllerGetAdminUserDetailV1({
        userId: userId!,
      });
      return res.data.data;
    },
    enabled: open && !!userId,
  });

  const handleBan = useCallback(() => {
    if (!userId) return;
    confirm(MyConfirmDialog, {
      title: '封禁用户',
      content: '封禁后用户将无法登录和使用平台功能，确认要封禁该用户吗？',
      iconColor: 'error.main',
      okButtonProps: { color: 'error' },
      onOk: async () => {
        setActionLoading(true);
        try {
          await API.AdminUser.AdminUserControllerBanUserV1({ userId });
          toast.success('已封禁用户');
          invalidate();
          onClose();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [userId, confirm, invalidate, onClose]);

  const handleUnban = useCallback(() => {
    if (!userId) return;
    confirm(MyConfirmDialog, {
      title: '解封用户',
      content: '解封后用户将恢复正常使用，确认要解封该用户吗？',
      iconColor: 'success.main',
      okButtonProps: { color: 'success' },
      onOk: async () => {
        setActionLoading(true);
        try {
          await API.AdminUser.AdminUserControllerUnbanUserV1({ userId });
          toast.success('已解封用户');
          invalidate();
          onClose();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [userId, confirm, invalidate, onClose]);

  const handleFreeze = useCallback(() => {
    if (!userId) return;
    confirm(MyConfirmDialog, {
      title: '冻结用户',
      content: '冻结后用户将无法进行资金操作，确认要冻结该用户吗？',
      iconColor: 'warning.main',
      okButtonProps: { color: 'warning' },
      onOk: async () => {
        setActionLoading(true);
        try {
          await API.AdminUser.AdminUserControllerFreezeUserV1({ userId });
          toast.success('已冻结用户');
          invalidate();
          onClose();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [userId, confirm, invalidate, onClose]);

  const handleUnfreeze = useCallback(() => {
    if (!userId) return;
    confirm(MyConfirmDialog, {
      title: '解冻用户',
      content: '解冻后用户将恢复正常资金操作，确认要解冻该用户吗？',
      iconColor: 'success.main',
      okButtonProps: { color: 'success' },
      onOk: async () => {
        setActionLoading(true);
        try {
          await API.AdminUser.AdminUserControllerUnfreezeUserV1({ userId });
          toast.success('已解冻用户');
          invalidate();
          onClose();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [userId, confirm, invalidate, onClose]);

  const handleApproveEnterprise = useCallback(() => {
    if (!userId) return;
    confirm(MyConfirmDialog, {
      title: '企业认证通过',
      content: '确认要通过该企业的认证申请吗？',
      iconColor: 'success.main',
      okButtonProps: { color: 'success' },
      onOk: async () => {
        setActionLoading(true);
        try {
          await API.AdminUser.AdminUserControllerApproveEnterpriseVerificationV1({
            userId,
          });
          toast.success('已通过企业认证');
          invalidate();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [userId, confirm, invalidate]);

  const handleRejectEnterpriseOpen = useCallback(() => {
    setRejectDialog({ open: true });
  }, []);

  const handleRejectEnterpriseClose = useCallback(() => {
    setRejectDialog({ open: false });
  }, []);

  const handleRejectEnterpriseSubmit = useCallback(
    async (reason: string) => {
      if (!userId) return;
      setActionLoading(true);
      try {
        await API.AdminUser.AdminUserControllerRejectEnterpriseVerificationV1(
          { userId },
          { reason: reason || undefined }
        );
        toast.success('已拒绝企业认证');
        invalidate();
        handleRejectEnterpriseClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '操作失败');
      } finally {
        setActionLoading(false);
      }
    },
    [userId, invalidate, handleRejectEnterpriseClose]
  );

  const handleRevertEnterprise = useCallback(() => {
    if (!userId) return;
    confirm(MyConfirmDialog, {
      title: '恢复待审核',
      content: '确认要将该企业认证恢复为待审核状态吗？恢复后需重新审核。',
      iconColor: 'warning.main',
      okButtonProps: { color: 'warning' },
      onOk: async () => {
        setActionLoading(true);
        try {
          await API.AdminUser.AdminUserControllerRevertEnterpriseVerificationToPendingV1({
            userId,
          });
          toast.success('已恢复为待审核');
          invalidate();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [userId, confirm, invalidate]);

  if (!open) return null;

  const displayName =
    user?.profile?.nickname || user?.profile?.companyName || user?.username || '—';
  const statusInfo = user ? STATUS_MAP[user.status] : null;
  const enterpriseInfo = user ? ENTERPRISE_STATUS_MAP[user.enterpriseVerificationStatus] : null;

  return (
    <>
      <MyDialog
        dialogTitle="用户详情"
        open={open}
        onClose={onClose}
        maxWidth="md"
        showActionButtons={false}
        fullWidth
        slotProps={{
          paper: {
            sx: {
              maxHeight: '90vh',
            },
          },
        }}
      >
        <DialogContent dividers sx={{ pt: 2 }}>
          {isPending ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Skeleton variant="circular" width={64} height={64} />
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Skeleton variant="text" width={200} height={32} />
                  <Skeleton variant="text" width={150} height={24} />
                </Stack>
              </Stack>
              <Skeleton variant="rectangular" height={200} />
            </Stack>
          ) : user ? (
            <Stack spacing={3}>
              {/* 基本信息 */}
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar src={user.avatar} alt={displayName} sx={{ width: 64, height: 64 }}>
                  {displayName?.charAt(0) || '?'}
                </Avatar>
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Typography variant="h6">{displayName}</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {statusInfo && (
                      <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                    )}
                    <Chip label={USER_TYPE_MAP[user.userType]} size="small" variant="outlined" />
                    {enterpriseInfo && (
                      <Chip
                        label={`企业认证${enterpriseInfo.label}`}
                        color={enterpriseInfo.color}
                        size="small"
                      />
                    )}
                    <Chip
                      label={`${RISK_LEVEL_MAP[user.riskLevel].label}风险`}
                      color={RISK_LEVEL_MAP[user.riskLevel].color}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    实名：{VERIFICATION_STATUS_MAP[user.verificationStatus]}
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              {/* 账号与联系 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  账号与联系
                </Typography>
                <Stack spacing={0.5}>
                  <InfoRow label="用户名" value={user.username} />
                  <InfoRow label="手机" value={user.phone ? fMobile(user.phone) : undefined} />
                  <InfoRow label="邮箱" value={user.email} />
                  <InfoRow label="注册来源" value={user.source} />
                  <InfoRow
                    label="注册时间"
                    value={user.createdAt ? fDateTime(user.createdAt) : undefined}
                  />
                  <InfoRow
                    label="验证时间"
                    value={user.verifiedAt ? fDateTime(user.verifiedAt) : undefined}
                  />
                  <InfoRow
                    label="最后登录"
                    value={user.lastLoginAt ? fDateTime(user.lastLoginAt) : undefined}
                  />
                  <InfoRow label="最后登录 IP" value={user.lastLoginIp} />
                </Stack>
              </Box>

              <Divider />

              {/* 资料 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  用户资料
                </Typography>
                <Stack spacing={0.5}>
                  <InfoRow label="昵称" value={user.profile?.nickname} />
                  <InfoRow label="真实姓名" value={user.profile?.realName} />
                  <InfoRow label="企业名称" value={user.profile?.companyName} />
                  <InfoRow label="法人代表" value={user.profile?.legalRepresentative} />
                  <InfoRow label="企业地址" value={user.profile?.companyAddress} />
                  <InfoRow label="个人地址" value={user.profile?.address} />
                </Stack>
              </Box>

              <Divider />

              {/* 资产与信用 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  资产与信用
                </Typography>
                <Stack spacing={0.5}>
                  <InfoRow label="可用余额" value={fCurrency((user.availableBalance ?? 0) / 100)} />
                  <InfoRow label="冻结余额" value={fCurrency((user.frozenBalance ?? 0) / 100)} />
                  <InfoRow label="信用评分" value={String(user.creditScore)} />
                  <InfoRow
                    label="资产限制"
                    value={`每日 ${user.maxDailyAssetCreationCount} / 总计 ${user.maxTotalAssetCount === 0 ? '不限' : user.maxTotalAssetCount} / 实例 ${user.maxTotalAssetInventoryCount}`}
                  />
                </Stack>
              </Box>

              {/* 身份证信息 */}
              {user.isVerified && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      ID 信息
                    </Typography>
                    <MultiFilePreview files={user.profile?.idCardPhotoUrls ?? []} />
                  </Box>
                </>
              )}

              {/* 企业认证材料 */}
              {user.userType === 'enterprise' &&
                (user.profile?.businessLicensePhotoUrls?.length ||
                  user.profile?.attachmentUrls?.length) && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        认证材料
                      </Typography>
                      <MultiFilePreview
                        files={(user.profile?.businessLicensePhotoUrls ?? []).concat(
                          user.profile?.attachmentUrls ?? []
                        )}
                      />
                    </Box>
                  </>
                )}
            </Stack>
          ) : (
            <Typography color="text.secondary">加载失败或用户不存在</Typography>
          )}
        </DialogContent>
        {user && (
          <DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}>
            {/* 账户状态操作 */}
            {user.status === 'active' && (
              <>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleFreeze}
                  disabled={actionLoading}
                  startIcon={<Iconify icon="solar:lock-password-outline" />}
                >
                  冻结
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleBan}
                  disabled={actionLoading}
                  startIcon={<Iconify icon="solar:forbidden-circle-bold" />}
                >
                  封禁
                </Button>
              </>
            )}
            {user.status === 'frozen' && (
              <Button
                variant="outlined"
                color="success"
                onClick={handleUnfreeze}
                disabled={actionLoading}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                解冻
              </Button>
            )}
            {user.status === 'banned' && (
              <Button
                variant="outlined"
                color="success"
                onClick={handleUnban}
                disabled={actionLoading}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                解封
              </Button>
            )}

            {/* 企业认证操作 */}
            {user.userType === 'enterprise' && user.enterpriseVerificationStatus === 'pending' && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRejectEnterpriseOpen}
                  disabled={actionLoading}
                >
                  拒绝
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleApproveEnterprise}
                  disabled={actionLoading}
                  startIcon={<Iconify icon="eva:checkmark-fill" />}
                >
                  通过
                </Button>
              </>
            )}
            {user.userType === 'enterprise' && user.enterpriseVerificationStatus === 'verified' && (
              <Button
                variant="outlined"
                color="warning"
                onClick={handleRevertEnterprise}
                disabled={actionLoading}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                恢复待审核
              </Button>
            )}
          </DialogActions>
        )}
      </MyDialog>

      <EnterpriseRejectDialog
        open={rejectDialog.open}
        onClose={handleRejectEnterpriseClose}
        onSubmit={handleRejectEnterpriseSubmit}
        loading={actionLoading}
        enterpriseName={user?.profile?.companyName}
      />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (value == null || value === '') return null;
  return (
    <Stack direction="row" spacing={1}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
        {label}：
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
