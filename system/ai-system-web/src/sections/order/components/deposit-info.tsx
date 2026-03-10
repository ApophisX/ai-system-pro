import { varAlpha } from 'minimal-shared/utils';

import { Box, Chip, Stack, Alert, Button, Divider, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CurrencyTypography } from 'src/components/custom';
import { HorizontalStack } from 'src/components/custom/layout';

import { TimeInfoItem } from './time-item';
import { OrderDetailPanel } from './order-detail-panel';
import { getDepositStatusLabelColor } from '../utils/order-status';

// ----------------------------------------------------------------------

type DepositInfoProps = {
  order: MyApi.OutputRentalOrderDto;
};

/**
 * 押金信息组件
 * 用于展示订单的押金信息，包括押金金额、状态等
 * 后续可扩展展示押金的退款、解冻、扣除等详细信息
 */
export function DepositInfo({ order }: DepositInfoProps) {
  const { depositAmount, depositStatus, depositStatusLabel } = order;

  // 押金状态标签和颜色映射
  const statusColor = getDepositStatusLabelColor(depositStatus);

  const firstDeposit = order.deposits?.[0] || {};

  const router = useRouter();

  // 如果没有押金，不显示
  if (depositStatus === 'none' || depositAmount === 0) {
    return null;
  }

  const isDeducted = firstDeposit?.deductedAmount > 0;
  return (
    <OrderDetailPanel>
      <HorizontalStack spacing={1.5} sx={{ mb: 2 }}>
        <Box
          sx={(theme) => ({
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
          })}
        >
          <Iconify icon="custom:money-cny-circle-line" width={24} sx={{ color: 'primary.main' }} />
        </Box>
        <Stack spacing={0.25} flex={1}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            押金信息
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            押金状态与扣款明细
          </Typography>
        </Stack>
        {firstDeposit.deductions && firstDeposit.deductions.length > 0 && (
          <Button
            variant="text"
            size="small"
            color="warning"
            sx={{ alignSelf: 'flex-start', px: 1 }}
            onClick={() => {
              router.push(paths.my.orderDepositRecords(order.id));
            }}
          >
            {firstDeposit.deductions.length}条扣款记录
            <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
          </Button>
        )}
      </HorizontalStack>

      <Stack spacing={2}>
        {/* 押金金额明细 */}
        <Stack
          spacing={1}
          sx={(theme) => ({
            p: 2.5,
            borderRadius: 1.5,
            bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
            border: `1px dashed ${varAlpha(theme.vars.palette.primary.mainChannel, 0.2)}`,
          })}
        >
          <HorizontalStack justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              押金金额
            </Typography>
            <HorizontalStack spacing={1}>
              {!isDeducted && (
                <Chip
                  label={depositStatusLabel}
                  color={statusColor}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, borderRadius: 0.5 }}
                />
              )}
              <HorizontalStack spacing={1}>
                {isDeducted && (
                  <Chip
                    label={depositStatusLabel}
                    color={statusColor}
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, borderRadius: 0.5 }}
                  />
                )}
                <CurrencyTypography currency={depositAmount} disableDivide />
              </HorizontalStack>
            </HorizontalStack>
          </HorizontalStack>

          {isDeducted && (
            <>
              <HorizontalStack justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  扣除金额
                </Typography>
                <CurrencyTypography
                  color="error.main"
                  isNegative={isDeducted}
                  currency={firstDeposit.deductedAmount}
                  disableDivide
                />
              </HorizontalStack>
              <HorizontalStack justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  押金剩余
                </Typography>
                <CurrencyTypography currency={firstDeposit.remainingAmount} disableDivide />
              </HorizontalStack>
            </>
          )}
        </Stack>

        {(firstDeposit.frozenAt || firstDeposit.unfrozenAt) && (
          <Divider sx={{ borderStyle: 'dashed' }} />
        )}

        {/* 时间信息 */}
        <Stack spacing={2}>
          <TimeInfoItem
            label={firstDeposit.freeType === 'none' ? '支付时间' : '免押时间'}
            value={firstDeposit.frozenAt}
          />
          <TimeInfoItem
            label={firstDeposit.freeType === 'none' ? '退还时间' : '解冻时间'}
            value={firstDeposit.unfrozenAt}
          />
        </Stack>
      </Stack>

      {/* 押金退还提示 */}
      {order.isDepositFrozenOrPaid ||
        (order.depositStatus === 'refunding' && (
          <Alert
            severity="info"
            icon={<Iconify icon="solar:info-circle-bold" width={20} />}
            sx={{ mt: 2 }}
          >
            押金将在归还商品后 1-7 个工作日内退还
          </Alert>
        ))}
    </OrderDetailPanel>
  );
}
