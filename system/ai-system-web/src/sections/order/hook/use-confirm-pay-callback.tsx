import { useCallback } from "react";
import { useDialogs } from "@toolpad/core/useDialogs";

import { Iconify } from "src/components/iconify";
import { MyConfirmDialog } from "src/components/custom/confirm-dialog";



export function useConfirmPayCallback() {

  const { open: openDialog } = useDialogs();

  const confirmPayCallback = useCallback(
    (title = '支付提醒', content = '是否已支付成功？') => new Promise((resolve, reject) => {
      setTimeout(() => {
        openDialog(MyConfirmDialog, {
          title,
          icon: <Iconify icon="solar:info-circle-bold" sx={{ color: 'primary.main', width: 28, height: 28, }} />,
          content,
          loadingText: '订单刷新中...',
          okButtonText: '是',
          cancelButtonText: '否',
          okButtonProps: { color: 'primary', }
        }, {
          onClose: async (confirmResult) => {
            if (confirmResult) {
              resolve(true);
            } else {
              reject(new Error('用户未完成支付'));
            }
          }
        })
      }, 750);
    }),
    [openDialog],
  )

  return {
    confirmPayCallback,
  };
}