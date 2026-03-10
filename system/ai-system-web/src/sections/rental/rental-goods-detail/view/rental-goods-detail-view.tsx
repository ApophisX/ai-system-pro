import type { GoodsItem } from '../../rental-goods/goods-card';

import React from 'react';
import { m } from 'framer-motion';
import { useDialogs } from '@toolpad/core/useDialogs';

import { Box, Stack, Button } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks/use-params';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import API from 'src/services/API';
import { useGetAssetDetail } from 'src/actions/assets';
import { AssetAuditStatus, AssetAuditStatusLabels } from 'src/constants/assets';

import { Label } from 'src/components/label';
import { ListEmptyContent } from 'src/components/empty-content';

import { useAssetStatus } from 'src/sections/lessor/assets/hooks/use-asset-status';
import { useAssetAction } from 'src/sections/lessor/assets/hooks/use-asset-action';

import { useAuthContext } from 'src/auth/hooks';

import { RentalGoodsDetailAppBar } from '../app-bar';
import { AddCommentDialog } from '../add-comment-dialog';
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
export const RentalGoodsDetailView: React.FC<Props> = ({ preview = false }) => {
  const { id = '' } = useParams();
  const searchParams = useSearchParams();
  const inventoryCode = searchParams.get('inventoryCode');

  const assetId = id as string;
  const router = useRouter();
  const dialogs = useDialogs();

  const { data: assetDetail, mutate, dataLoading } = useGetAssetDetail(preview, assetId);

  const { isOnline, editable, canPublish, isAuditing } = useAssetStatus(assetDetail);
  const { handleOnEdit, handleOnOffline, handleOnOnline } = useAssetAction();

  const isPartner = assetDetail?.owner?.isEnterpriseVerified || false;

  if (dataLoading) {
    return <AssetDetailSkeleton />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      {/* 顶部导航栏 */}
      <RentalGoodsDetailAppBar
        preview={preview || !assetDetail}
        assetDetail={assetDetail}
        onFavorite={async () => {
          if (assetDetail) {
            mutate(
              { data: { ...assetDetail, isFavorite: !assetDetail.isFavorite } },
              { revalidate: false }
            );
            const params = { assetId: assetDetail.id };

            if (assetDetail.isFavorite) {
              await API.AppFavorite.AppFavoriteControllerRemoveV1(params, {
                fetchOptions: { showSuccess: false },
              });
            } else {
              await API.AppFavorite.AppFavoriteControllerCreateV1(params, {
                fetchOptions: { showSuccess: false },
              });
            }
          }
        }}
        onComment={() => {
          if (assetId) {
            dialogs.open(AddCommentDialog, {
              assetId,
              onSuccess: () => {
                // 可以在这里刷新留言列表
                mutate();
              },
            });
          }
        }}
      />
      {assetDetail ? (
        <RentalGoodsDetailContent assetDetail={assetDetail} />
      ) : (
        <ListEmptyContent title="资产不存在" slotProps={{ root: { sx: { minHeight: '90vh' } } }} />
      )}

      {/* 底部操作栏 */}
      {assetDetail && (
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
          {preview ? (
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
          ) : (
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              {isOnline && (
                <>
                  <Button
                    variant="outlined"
                    sx={{
                      minWidth: 100,
                      color: 'text.primary',
                    }}
                    href={`tel:${assetDetail.contactPhone}`}
                    onClick={() => {
                      // TODO 跳转微信OR支付宝客服链接
                    }}
                  >
                    咨询
                  </Button>
                  {isPartner && (
                    <Button
                      component={m.button}
                      whileTap={{ scale: 0.98 }}
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{
                        fontWeight: 700,
                        py: 1.5,
                      }}
                      onClick={() => {
                        if (inventoryCode) {
                          router.push(
                            `${paths.rental.orderConfirm.root(assetId)}?inventoryCode=${inventoryCode}`
                          );
                        } else {
                          router.push(paths.rental.orderConfirm.root(assetId));
                        }
                      }}
                    >
                      {assetDetail?.isMallProduct ? '立即购买' : '立即租赁'}
                    </Button>
                  )}
                </>
              )}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
};
