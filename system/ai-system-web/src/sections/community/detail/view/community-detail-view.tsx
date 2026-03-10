import { useParams } from 'react-router';
import { useCallback, useState } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { MyConfirmDialog } from 'src/components/custom';
import { MobileLayout } from 'src/components/custom/layout';
import { EmptyContent } from 'src/components/empty-content';

import { CommunityDeleteDialog } from '../community-delete-dialog';

// ----------------------------------------------------------------------

export function CommunityDetailView() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { open } = useDialogs();
  const [resetLoading, setResetLoading] = useState(false);

  const { data: res, isPending } = useQuery({
    queryKey: ['community-detail', id],
    queryFn: () => API.AppCommunity.AppCommunityControllerGetDetailV1({ id: id! }),
    enabled: !!id,
  });

  const community = res?.data?.data;

  const handleCopyInviteCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('邀请码已复制');
  }, []);

  const handleResetInviteCode = useCallback(() => {
    if (!id) return;
    open(MyConfirmDialog, {
      title: '重置邀请码',
      content: '重置后旧邀请码将失效，新邀请码将立即生效。确定要重置吗？',
      iconColor: 'warning.main',
      okButtonText: '确认重置',
      onOk: async () => {
        setResetLoading(true);
        try {
          await API.AppCommunity.AppCommunityControllerResetInviteCodeV1({ id });
          toast.success('邀请码已重置');
          queryClient.invalidateQueries({ queryKey: ['community-detail', id] });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '重置失败');
        } finally {
          setResetLoading(false);
        }
      },
    });
  }, [id, open, queryClient]);

  const handleDeleteOpen = useCallback(() => {
    if (!id || !community) return;
    open(CommunityDeleteDialog, {
      id,
      communityName: community.name,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['community-my-joined'] });
        queryClient.invalidateQueries({ queryKey: ['community-my-created'] });
        router.replace(paths.community.root);
      },
    });
  }, [id, community, open, queryClient, router]);

  const handleLeave = useCallback(() => {
    if (!id) return;
    open(MyConfirmDialog, {
      title: '退出社区',
      content: '退出后你将无法浏览该社区内的商品，确定要退出吗？',
      iconColor: 'warning.main',
      okButtonText: '退出',
      onOk: async () => {
        try {
          await API.AppCommunity.AppCommunityControllerLeaveV1({ id });
          toast.success('已退出社区');
          queryClient.invalidateQueries({ queryKey: ['community-detail', id] });
          queryClient.invalidateQueries({ queryKey: ['community-my-joined'] });
          router.replace(paths.community.root);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '退出失败');
        }
      },
    });
  }, [id, queryClient, router, open]);

  if (!id) {
    return (
      <MobileLayout appTitle="社区详情">
        <EmptyContent
          imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
          title="社区不存在"
          sx={{ py: 8 }}
        />
      </MobileLayout>
    );
  }

  if (isPending) {
    return (
      <MobileLayout appTitle="社区详情">
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
        </Stack>
      </MobileLayout>
    );
  }

  if (!community) {
    return (
      <MobileLayout appTitle="社区详情">
        <EmptyContent
          imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
          title="社区不存在或已关闭"
          sx={{ py: 8 }}
        />
      </MobileLayout>
    );
  }

  const isCreator = community.role === 'creator';
  const isAdmin = community.role === 'admin';
  const isMember = community.joined && (community.role === 'member' || community.role === 'admin');
  const canDelete = isCreator;
  const canLeave = isMember;
  const canSeeInviteCode = community.type === 'private' && (isCreator || isAdmin);
  const canResetInviteCode = isCreator && !!community.inviteCode;

  return (
    <MobileLayout appTitle={community.name}>
      <Stack spacing={2}>
        {community.coverImage && (
          <Box
            component="img"
            src={community.coverImage}
            alt={community.name}
            sx={{
              width: '100%',
              height: 180,
              objectFit: 'cover',
              borderRadius: 2,
              bgcolor: 'grey.200',
            }}
          />
        )}
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {community.name}
        </Typography>
        {community.description && (
          <Typography variant="body2" color="text.secondary">
            {community.description}
          </Typography>
        )}

        {/* 邀请码：私密社区且为创建者/管理员可见 */}
        {canSeeInviteCode && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                邀请码
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 2,
                  fontFamily: 'monospace',
                  mt: 0.25,
                }}
              >
                {community.inviteCode || '—'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              {community.inviteCode && (
                <IconButton
                  size="small"
                  onClick={() => handleCopyInviteCode(community.inviteCode!)}
                  sx={{ color: 'primary.main' }}
                  aria-label="复制邀请码"
                >
                  <Iconify icon="solar:copy-bold" width={20} />
                </IconButton>
              )}
              {canResetInviteCode && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleResetInviteCode}
                  disabled={resetLoading}
                  startIcon={<Iconify icon="solar:restart-bold" width={18} />}
                >
                  {resetLoading ? '重置中...' : '重置'}
                </Button>
              )}
            </Stack>
          </Paper>
        )}

        {/* 操作按钮：创建者-删除社区 / 成员-退出 */}
        {(canDelete || canLeave) && (
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
            {/* 已加入：进入社区浏览商品 */}
            {community.joined && community.status === 'approved' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:cart-3-bold" width={20} />}
                onClick={() => router.push(paths.community.assets(id!))}
              >
                浏览社区商品
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={handleDeleteOpen}
              >
                删除社区
              </Button>
            )}
            {canLeave && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:export-bold" />}
                onClick={handleLeave}
              >
                退出社区
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </MobileLayout>
  );
}
