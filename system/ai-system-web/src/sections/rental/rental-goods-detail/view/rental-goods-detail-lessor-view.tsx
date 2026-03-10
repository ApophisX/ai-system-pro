import type { GoodsItem } from '../../rental-goods/goods-card';

import React from 'react';
import { m } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useDialogs } from '@toolpad/core/useDialogs';

import { Box, Stack, Button, AppBar, Toolbar, IconButton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useParams } from 'src/routes/hooks/use-params';

import API from 'src/services/API';
import { useGetMyAssetDetail } from 'src/actions/assets';
import { AssetAuditStatus, AssetAuditStatusLabels } from 'src/constants/assets';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { MyConfirmDialog } from 'src/components/custom/confirm-dialog';

import { useAssetStatus } from 'src/sections/lessor/assets/hooks/use-asset-status';
import { useAssetAction } from 'src/sections/lessor/assets/hooks/use-asset-action';

import { useAuthContext } from 'src/auth/hooks';

import { AssetDetailSkeleton } from '../asset-detail-skeleton';
import { RentalGoodsDetailContent } from '../rental-goods-detail-content';

// ----------------------------------------------------------------------

// 扩展商品详情接口
export interface GoodsDetail extends GoodsItem {
  description: string;
  images: string[];
  deposit: number;
  minRentalDays: number;
  maxRentalDays: number;
  monthlyPrice: number;
  weeklyPrice: number;
  dailyPrice: number;
  specifications: { label: string; value: string }[];
  ownerPhone?: string;
  ownerLocation: string;
  availableDates: string[];
}

type Props = {
  preview?: boolean;
};
export const RentalGoodsDetailLessorView: React.FC<Props> = ({ preview = true }) => {
  const { id = '' } = useParams();
  const assetId = id as string;
  const router = useRouter();
  const { user } = useAuthContext();
  const isPartner = user?.isEnterpriseVerified || false;

  const { data: assetDetail, mutate, dataLoading } = useGetMyAssetDetail(assetId);

  const { open: openConfirmDialog } = useDialogs();

  const { isOnline, editable, canPublish, isAuditing } = useAssetStatus(assetDetail);
  const { handleOnEdit, handleOnOffline, handleOnOnline } = useAssetAction();

  if (dataLoading) {
    return <AssetDetailSkeleton />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      {/* 顶部导航栏 */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 0,
          bgcolor: 'transparent',
          backgroundImage: 'none',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 1 }}>
          <IconButton
            component={m.button}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              router.back();
            }}
            sx={{
              bgcolor: 'background.default',
              backdropFilter: 'blur(8px)',
              color: 'text.primary',
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>

          {isPartner && !assetDetail?.isMallProduct && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                router.push(paths.lessor.assets.inventory.list(assetId));
              }}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
            >
              查看资产实例
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {assetDetail ? (
        <>
          <RentalGoodsDetailContent assetDetail={assetDetail} />
          {/* 底部操作栏 */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
              p: 2,
              zIndex: 1000,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              {editable && (
                <>
                  {isAuditing && (
                    <Label variant="outlined" color="info">
                      {AssetAuditStatusLabels[AssetAuditStatus.PENDING]}
                    </Label>
                  )}
                  <Button
                    variant="outlined"
                    fullWidth
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} height={16} />}
                    onClick={(e) => {
                      if (assetDetail) {
                        openConfirmDialog(MyConfirmDialog, {
                          title: '确定要删除该资产吗？',
                          content:
                            '删除资产后，资产将不再展示在租赁平台上，其他用户将无法租赁该资产。',
                          okButtonText: '删除',
                          loadingText: '删除中，请稍后...',
                          onOk: async () => {
                            await API.AppAsset.AppAssetControllerDeleteAssetV1({
                              id: assetDetail.id,
                            });
                            router.back();
                          },
                        });
                      }
                    }}
                  >
                    删除
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="solar:pen-bold" width={16} height={16} />}
                    onClick={(e) => {
                      if (assetDetail) {
                        handleOnEdit(e, assetDetail);
                      }
                    }}
                  >
                    编辑
                  </Button>
                </>
              )}
              {isOnline && (
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  startIcon={<Iconify icon="solar:inbox-in-bold-duotone" width={16} height={16} />}
                  onClick={async (e) => {
                    if (assetDetail) {
                      await handleOnOffline(e, assetDetail);
                      mutate();
                    }
                  }}
                >
                  下架
                </Button>
              )}
              {canPublish && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<Iconify icon="solar:export-bold" width={16} height={16} />}
                  onClick={async (e) => {
                    if (assetDetail) {
                      await handleOnOnline(e, assetDetail);
                      mutate();
                    }
                  }}
                >
                  发布
                </Button>
              )}
            </Stack>
          </Box>
        </>
      ) : (
        <EmptyContent
          title="资产不存在"
          sx={{ minHeight: '100vh' }}
          action={
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
              onClick={() => {
                router.replace('/');
              }}
            >
              返回首页
            </Button>
          }
        />
      )}
    </Box>
  );
};
