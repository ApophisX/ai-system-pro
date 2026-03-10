import { useCallback } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';

import { Iconify } from 'src/components/iconify';
import { MyConfirmDialog } from 'src/components/custom/confirm-dialog';

export function useAssetAction() {
  const { open } = useDialogs();
  const router = useRouter();
  const handleOnEdit = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, asset: MyApi.OutputMyAssetListItemDto) => {
      e.preventDefault();
      e.stopPropagation();
      router.push(paths.lessor.assets.edit(asset.id));
    },
    [router]
  );

  const handleOnOffline = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, asset: MyApi.OutputMyAssetListItemDto) => {
      e.preventDefault();
      e.stopPropagation();
      return new Promise((resolve) => {
        open(
          MyConfirmDialog,
          {
            title: '确定要下架资产吗？',
            content: '下架资产后，资产将不再展示在租赁平台上，其他用户将无法租赁该资产。',
            okButtonText: '下架',
            loadingText: '下架中，请稍后...',
            onOk: async () => {
              await API.AppAsset.AppAssetControllerOfflineAssetV1(
                { id: asset.id },
                { fetchOptions: { useApiMessage: true } }
              );
              resolve(true);
            }
          },
        );
      });
    },
    [open]
  );

  const handleOnOnline = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, asset: MyApi.OutputMyAssetListItemDto) => {
      e.preventDefault();
      e.stopPropagation();

      return new Promise((resolve) => {
        open(
          MyConfirmDialog,
          {
            title: '确定要发布资产吗？',
            content: '发布资产后，资产将展示在租赁平台上，其他用户可以租赁该资产。',
            okButtonProps: { color: 'primary' },
            okButtonText: '发布',
            loadingText: '发布中，请稍后...',
            icon: (
              <Iconify
                icon="solar:info-circle-bold"
                sx={{ width: 28, height: 28, color: 'info.main' }}
              />
            ),
            onOk: async () => {
              await API.AppAsset.AppAssetControllerPublishAssetV1(
                { id: asset.id },
                { fetchOptions: { useApiMessage: true } }
              );
              resolve(true);
            }
          },
        );
      });
    },
    [open]
  );

  const handleOnClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, asset: MyApi.OutputMyAssetListItemDto) => {
      router.push(paths.lessor.assets.preview(asset.id));
    },
    [router]
  );

  return {
    handleOnEdit,
    handleOnOffline,
    handleOnOnline,
    handleOnClick,
  };
}
