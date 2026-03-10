import { Alert } from '@mui/material';

import { FadeInBox } from 'src/components/custom';

/**
 * 订单争议中平台审核提示
 *
 * @description
 * 仅在订单状态为 'dispute' 时显示
 */
export function DisputeOrderAlert({ order }: { order: MyApi.OutputRentalOrderDto }) {
  if (order.status !== 'dispute') {
    return null;
  }
  return (
    <FadeInBox>
      <Alert severity="info">
        该订单涉嫌争议，平台正在核实相关信息。请保持沟通畅通，审核通过后将第一时间通知您，请耐心等待处理结果。
      </Alert>
    </FadeInBox>
  );
}
