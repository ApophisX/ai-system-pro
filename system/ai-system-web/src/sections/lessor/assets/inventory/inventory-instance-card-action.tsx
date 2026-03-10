import type { useInventoryAction } from './hooks/use-inventory-action';

import { Button } from '@mui/material';

import { AssetInventoryStatus } from 'src/constants/asset-inventory';

import { Iconify } from 'src/components/iconify';
import { HorizontalStack } from 'src/components/custom/layout';

export type InventoryInstanceCardActionProps = {
  instance: MyApi.OutputAssetInventoryDto;
  assetId: string;
} & Partial<ReturnType<typeof useInventoryAction>>;
export function InventoryInstanceCardAction(props: InventoryInstanceCardActionProps) {
  const { instance, assetId, handleEdit, handleDelete, handleUnbind, handleBindOrder } = props;

  const buttonProps = {
    'data-asset-id': assetId,
    'data-instance-id': instance.id,
  };

  return (
    <HorizontalStack justifyContent="flex-end" spacing={1}>
      {instance.status !== AssetInventoryStatus.RENTED && (
        <>
          {/* <Button {...buttonProps} onClick={handleBindOrder} variant="contained" startIcon={<Iconify icon="solar:user-id-bold" width={18} />}>
              绑定订单
            </Button> */}
          <Button
            {...buttonProps}
            onClick={handleEdit}
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" width={18} />}
          >
            编辑
          </Button>

          <Button
            {...buttonProps}
            onClick={handleDelete}
            color="error"
            variant="contained"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={18} />}
          >
            删除
          </Button>
        </>
      )}
      {instance.status === AssetInventoryStatus.RENTED && (
        <Button {...buttonProps} onClick={handleUnbind} variant="contained" color="error">
          强制解绑
        </Button>
      )}
    </HorizontalStack>
  );
}
