import { useCallback } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';
import { useApiMutation } from 'src/lib/use-api-mutation';

import { MyConfirmDialog } from 'src/components/custom/confirm-dialog';

type InventoryActionProps = {
  callback?: () => void;
  onDeleteSuccess?: () => void;
};
export function useInventoryAction({
  callback,
  onDeleteSuccess,
}: InventoryActionProps | undefined = {}) {
  const router = useRouter();
  const { open: openDialog } = useDialogs();

  const { mutateAsync: mutateDelete } = useApiMutation(
    API.AppAssetInventory.AppAssetInventoryControllerDeleteV1
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const { assetId, instanceId } = event.currentTarget.dataset;
      if (!assetId || !instanceId) return;
      router.push(paths.lessor.assets.inventory.detail(assetId, instanceId));
    },
    [router]
  );
  const handleEdit = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const { assetId, instanceId } = event.currentTarget.dataset;
      if (!assetId || !instanceId) return;
      router.push(paths.lessor.assets.inventory.edit(assetId, instanceId));
    },
    [router]
  );
  const handleDelete = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const { assetId, instanceId } = event.currentTarget.dataset;
      if (!assetId || !instanceId) return;
      openDialog(MyConfirmDialog, {
        title: '删除资产实例',
        content: '确定删除该资产实例吗？',
        loadingText: '删除中...',
        okButtonText: '删除',
        cancelButtonText: '取消',
        onOk: async () => {
          await mutateDelete({ id: instanceId });
          onDeleteSuccess?.();
        },
      });
    },
    [mutateDelete, onDeleteSuccess, openDialog]
  );
  const handleUnbind = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const { assetId, instanceId } = event.currentTarget.dataset;
      if (!assetId || !instanceId) return;
      openDialog(MyConfirmDialog, {
        title: '强制解绑资产实例',
        content: '确定强制解绑该资产实例吗？',
        loadingText: '强制解绑中...',
        onOk: async () => {
          await API.AppAssetInventory.AppAssetInventoryControllerForceUnbindV1({ id: instanceId });
          callback?.();
        },
      });
    },
    [callback, openDialog]
  );
  const handleBindOrder = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {}, []);

  return {
    handleClick,
    handleEdit,
    handleDelete,
    handleUnbind,
    handleBindOrder,
  };
}
