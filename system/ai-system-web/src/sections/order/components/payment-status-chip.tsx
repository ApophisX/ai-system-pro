import { Chip } from '@mui/material';

type Props = {
  status: MyApi.OutputPaymentDto['status'];
  label: string;
};

// 续租支付状态标签
export function PaymentStatusChip({ status, label }: Props) {
  const colorMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    pending: 'warning',
    due: 'warning',
    paid: 'success',
    completed: 'success',
    overdue: 'error',
    canceled: 'default',
    closed: 'default',
    expired: 'error',
    partial_paid: 'info',
    generating: 'default',
  };

  return (
    <Chip
      label={label}
      size="small"
      color={colorMap[status] || 'default'}
      variant="soft"
      sx={{ height: 20, fontSize: 11, borderRadius: 0.5 }}
    />
  );
}
