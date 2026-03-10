import { useMemo } from 'react';
import { FileText } from 'lucide-react';

import { Stack, Paper, Typography } from '@mui/material';

import { OrderDetailPanel, OrderEvidenceImageSection } from 'src/sections/order/components';

type Props = {
  order: MyApi.OutputRentalOrderDto;
};

export function LesseeCancelOrderEvidencesSection(props: Props) {
  const { order } = props;

  // 收集所有凭证图片 URL
  const evidence = useMemo(
    () =>
      order.evidences.find(
        (e) => e.submitterType === 'lessee' && e.evidenceType === 'order_cancel'
      ),
    [order.evidences]
  );

  if (!evidence) {
    return null;
  }

  const images = evidence.evidenceUrls || [];

  if (order.status !== 'cancel_pending') {
    return null;
  }

  return (
    <OrderDetailPanel>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <FileText size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          用户取消订单申请
        </Typography>
      </Stack>

      {/* 取消原因 */}
      <Stack spacing={2}>
        <Paper sx={{ p: 2, borderRadius: 1, bgcolor: 'background.neutral' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            取消原因：
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {evidence.description}
          </Typography>
          {/* 凭证图片 */}
        </Paper>
        <OrderEvidenceImageSection images={images} />
      </Stack>
    </OrderDetailPanel>
  );
}
