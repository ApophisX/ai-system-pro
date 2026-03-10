
import { useMemo } from "react";
import { FileText } from "lucide-react";

import { Stack, Paper, Typography } from "@mui/material";

import { OrderDetailPanel, OrderEvidenceImageSection } from "src/sections/order/components";


type Props = {
  order: MyApi.OutputRentalOrderDto;
};

export function LessorRejectCancelOrderEvidencesSection(props: Props) {
  const { order } = props;

  // 收集所有凭证图片 URL
  const evidence = useMemo(() => order.evidences.find(e => e.submitterType === 'lessor' && e.evidenceType === 'order_cancel_reject'), [order.evidences]);

  if (!evidence) {
    return null;
  }
  const images = evidence.evidenceUrls || [];
  return (
    <OrderDetailPanel>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }} color="error.main">
        <FileText size={20} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          商家拒绝取消订单申请
        </Typography>
      </Stack>

      {/* 取消原因 */}
      {order.cancelReason && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 1, bgcolor: 'background.neutral' }} >
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            拒绝原因：
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {order.lessorCancelRejectReason}
          </Typography>
        </Paper>
      )}

      {/* 凭证图片 */}
      <OrderEvidenceImageSection images={images} />
    </OrderDetailPanel>
  )
}