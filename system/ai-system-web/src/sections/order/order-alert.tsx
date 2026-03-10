import { Alert, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { FadeInBox } from 'src/components/custom';

import { DisputeOrderAlert } from './components';

export function LesseeOrderAlert({ order }: { order: MyApi.OutputRentalOrderDto }) {
  // 押金扣款待用户确认
  const isDepositDeductionPending = order.deposits[0]?.deductions.some(
    (d) => d.status === 'pending_user_confirm'
  );

  const isOverdue = order.overdueStatus === 'overdue_use' || order.overdueStatus === 'overdue';

  // 押金退款待处理
  const isDepositRefundPending =
    order.useageStatus === 'returned' &&
    order.remainingDepositAmount > 0 &&
    order.isDepositFrozenOrPaid &&
    !isDepositDeductionPending;

  return (
    <>
      {/* 确认收货提醒 */}
      {order.status === 'pending_receipt' && order.inventory && (
        <FadeInBox>
          <Alert severity="warning">
            商家已发货，请您在收到商品后及时确认收货。如有疑问或异常情况，请联系出租方或平台客服协助处理，避免产生额外费用。
          </Alert>
        </FadeInBox>
      )}

      {/* 押金扣款待用户确认提醒信息 */}
      {isDepositDeductionPending && (
        <FadeInBox>
          <Alert severity="warning">
            您有一笔押金扣款待您确认，确认后平台将按照协议处理相关资金。
            <RouterLink
              href={paths.my.orderDepositRecords(order.id)}
              style={{
                textDecoration: 'none',
                color: 'var(--primary-main)',
                fontWeight: 700,
              }}
            >
              去确认
            </RouterLink>
          </Alert>
        </FadeInBox>
      )}

      {/* 押金退款待处理提醒信息 */}
      {isDepositRefundPending && !isOverdue && (
        <FadeInBox>
          <Alert severity="info">
            押金将在归还商品后
            <Typography
              color="success.main"
              variant="body2"
              component="span"
              sx={{ fontWeight: 600, px: 0.5 }}
            >
              1-7 个工作日
            </Typography>
            原路退回，无需操作。若超时未到账，请及时联系出租方或平台客服协助处理。
          </Alert>
        </FadeInBox>
      )}

      {/* 订单逾期提醒信息 */}
      {isOverdue && (
        <FadeInBox>
          {order.overdueStatus === 'overdue_use' && (
            <Alert severity="error">
              订单已超时，请立即归还资产并结清相关费用，以免产生额外逾期费用。如有疑问，请及时联系客服。
            </Alert>
          )}
          {order.overdueStatus === 'overdue' && (
            <Alert severity="error">
              您的订单存在逾期未支付的账单，请尽快完成支付。逾期不处理将影响您的信用和后续使用，请及时处理。
            </Alert>
          )}
        </FadeInBox>
      )}

      {/* 订单争议中平台审核提示 */}
      <DisputeOrderAlert order={order} />

      {/* 分期账待支付提醒 */}
      {order.hasPendingInstallment && order.isInUse && (
        <FadeInBox>
          <Alert severity="warning">
            您的订单存在分期账单待支付，请尽快完成支付，避免产生更多逾期费用和信用影响。如有疑问，请及时联系客服。
          </Alert>
        </FadeInBox>
      )}

      {/* 分期账单逾期未支付提醒 */}
      {order.hasOverduePendingInstallment && order.isInUse && order.overdueStatus === 'none' && (
        <FadeInBox>
          <Alert severity="warning">
            您的订单存在分期账单逾期未支付，请尽快完成支付，避免产生更多逾期费用和信用影响。如有疑问，请及时联系客服。
          </Alert>
        </FadeInBox>
      )}

      {/* 订单取消中，请等待出租方确认 */}
      {order.isCancelPending && (
        <FadeInBox>
          <Alert severity="info">
            订单取消中，请等待出租方确认，若出租方24小时内未确认，则订单将自动取消，支付款项将原路退回，请耐心等待。
          </Alert>
        </FadeInBox>
      )}

      {order.isReturnedPending && (
        <FadeInBox>
          <Alert severity="warning">
            您已申请归还，请尽快与出租方完成归还确认。平台将在确认后及时处理相关资金，请留意进度。如有疑问请联系平台客服。
          </Alert>
        </FadeInBox>
      )}
    </>
  );
}
