import type { ChipProps } from '@mui/material';
import type { OrderStatusColor } from '../utils/order-status';

import { useMemo } from 'react';
import { m } from 'framer-motion';
import { MapPin, FileText, CreditCard } from 'lucide-react';

import { Box, Chip, Stack, Button, Avatar, Typography, IconButton, Divider } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMapBridge } from 'src/hooks/use-bridge';

import { fCurrency, fDateTime } from 'src/utils';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { CurrencyTypography } from 'src/components/custom';
import { HorizontalStack } from 'src/components/custom/layout';

import { useGetUserRole } from 'src/sections/my/hooks/use-role';

import { OrderDetailPanel } from './order-detail-panel';
import {
  getOrderStatusLabelColor,
  getRefundStatusLabelColor,
  getUseageStatusLabelColor,
  getOverdueStatusLabelColor,
} from '../utils/order-status';

type Props = {
  order: MyApi.OutputRentalOrderDto;
};

// 订单基本信息
export function OrderBaseInfoSection({ order }: Props) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2}>
        <Image
          src={order.assetSnapshot?.coverImage}
          sx={{
            width: 100,
            height: 100,
            borderRadius: 1.5,
            flexShrink: 0,
            bgcolor: (theme) => theme.palette.grey[200],
          }}
          slotProps={{ img: { sx: { objectFit: 'contain' } } }}
        />
        <Stack spacing={0} sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }} noWrap>
            {order.assetSnapshot?.name}
          </Typography>

          {order.isProductPurchase ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                商品规格：{order.assetSnapshot?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                商品数量：{order.duration}
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={0.5}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                租赁方案：{order.rentalPlanSnapshot?.name}
              </Typography>
              <HorizontalStack alignItems="center" spacing={0}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  租赁时长：
                </Typography>
                <Chip
                  label={`${order.duration * order.rentalPeriod} ${order.durationUnitLabel}`}
                  color="info"
                  size="small"
                  sx={{ height: 20, fontSize: '0.75rem', borderRadius: 0.5, mr: 1 }}
                />
                {order.isInstallment && (
                  <Chip
                    label={`${order.rentalPeriod}期`}
                    color="info"
                    size="small"
                    sx={{ height: 20, fontSize: '0.75rem', borderRadius: 0.5 }}
                  />
                )}
              </HorizontalStack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                租金金额：¥{order.rentalPlanSnapshot?.price} / {order.durationUnitLabel}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
      {/* 设备信息 */}

      {order.inventory && (
        <Stack>
          <HorizontalStack spacing={0.5}>
            <Iconify icon="solar:box-minimalistic-bold" width={20} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1 }}>
              设备信息
            </Typography>
            {order.isInUse && (
              <>
                {order.inventory?.status === 'rented' && (
                  <Chip
                    label="使用中"
                    color="success"
                    size="small"
                    sx={{ height: 20, fontSize: '0.75rem', borderRadius: 0.5 }}
                  />
                )}
                {order.inventory?.status === 'available' && (
                  <Chip
                    label="已解绑"
                    size="small"
                    sx={{ height: 20, fontSize: '0.75rem', borderRadius: 0.5 }}
                  />
                )}
              </>
            )}
          </HorizontalStack>
          <Box sx={{ mt: 1, color: 'text.secondary' }}>
            <Typography variant="body2">设备名称：{order.inventory?.instanceName}</Typography>
            <Typography variant="body2">设备编码：{order.inventory?.instanceCode}</Typography>
            {order.deliveredAt && (
              <Typography variant="body2">绑定时间：{fDateTime(order.deliveredAt)}</Typography>
            )}
            {order.inventoryUnboundAt && (
              <Typography variant="body2">
                解绑时间：{fDateTime(order.inventoryUnboundAt)}
              </Typography>
            )}
          </Box>
        </Stack>
      )}
    </Stack>
  );
}

// 租金信息
export function OrderPriceInfoSection({ order }: Props) {
  const router = useRouter();

  // 渲染退款状态芯片
  const renderStatusChip = () => {
    if (order.payableOverdueUseAmount > 0 && order.overdueStatus !== 'overdue_fee_paid') {
      return '';
    }

    let text = '';
    let chipColor: OrderStatusColor = getRefundStatusLabelColor(order.refundStatus);
    if (order.refundStatus !== 'none') {
      text = order.refundStatusLabel;
    } else {
      if (order.isInstallment) {
        if (order.isPaidPartiallyInstallment || order.isPartialPaidRental) {
          text = '部分支付';
          chipColor = 'warning';
        }
      } else {
        if (order.isAllPaidRental || order.payStatus === 'completed') {
          text = '已支付';
          chipColor = 'success';
        }
      }
    }
    if (text) {
      return (
        <Chip
          label={text}
          size="small"
          color={chipColor}
          sx={{ height: 20, fontSize: '0.75rem', borderRadius: 0.5 }}
        />
      );
    }
    return null;
  };

  // 渲染超时费用芯片
  const renderOverdueUseFeeChip = () => {
    if (order.payableOverdueUseAmount > 0) {
      return (
        <Chip
          label={order.overdueStatus === 'overdue_fee_paid' ? '已支付' : '未支付'}
          color={getOverdueStatusLabelColor(order.overdueStatus)}
          size="small"
          sx={{ height: 20, fontSize: '0.75rem', borderRadius: 0.5 }}
        />
      );
    }
    return null;
  };

  return (
    <Stack spacing={1.5}>
      <HorizontalStack spacing={0.5}>
        <Iconify icon="solar:wad-of-money-bold" width={20} />
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1 }}>
          支付金额
        </Typography>
        <Button
          variant="text"
          size="small"
          color="primary"
          onClick={() => {
            router.push(paths.my.orderPayments(order.id));
          }}
        >
          查看明细
          <Iconify icon="eva:arrow-ios-forward-fill" width={16} height={16} />
        </Button>
      </HorizontalStack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {order.isProductPurchase ? '商品金额' : '租金'}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {fCurrency(order.rentalAmount)}
        </Typography>
      </Stack>
      {order.payableOverdueUseAmount > 0 && (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            超时费用
          </Typography>
          <HorizontalStack spacing={1}>
            {renderOverdueUseFeeChip()}
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              {fCurrency(order.payableOverdueUseAmount)}
            </Typography>
          </HorizontalStack>
        </Stack>
      )}
      {order.needDelivery && order.assetSnapshot.deliveryFee > 0 && (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            运费
          </Typography>
          <HorizontalStack spacing={1}>
            {order.isPaidDeliveryFee && (
              <Chip
                label="已支付"
                color="success"
                size="small"
                sx={{ height: 20, fontSize: '0.75rem', borderRadius: 0.5 }}
              />
            )}
            <CurrencyTypography
              currency={order.assetSnapshot.deliveryFee}
              disableDivide
              slotProps={{ integer: { sx: { fontWeight: 'bold' } } }}
            />
          </HorizontalStack>
        </Stack>
      )}
      {order.discountAmount > 0 && (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            优惠金额
          </Typography>
          <CurrencyTypography
            currency={order.discountAmount}
            isNegative
            disableDivide
            color="error"
          />
        </Stack>
      )}
      <HorizontalStack direction="row" justifyContent="space-between" spacing={1}>
        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          合计
        </Typography>
        {renderStatusChip()}
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          ¥{order.orderAmount}
        </Typography>
      </HorizontalStack>
    </Stack>
  );
}

// 订单状态芯片
export function OrderStatusChip({ order, ...props }: Props & ChipProps) {
  const isEnd = order.isOrderEnded;

  const { userRole } = useGetUserRole();

  if (order.isProductPurchase && order.isPaid && order.isReturned) {
    if (order.refundStatus === 'completed') {
      return <Chip label="已退款" color="default" size="small" {...props} />;
    }
    if (order.status === 'received') {
      return <Chip label="已收货" color="success" size="small" {...props} />;
    }
  }

  if (isEnd) {
    return (
      <Chip
        label={order.statusLabel}
        color={getOrderStatusLabelColor(order.status)}
        size="small"
        {...props}
      />
    );
  } else {
    if (userRole === 'lessor' && order.status === 'pending_receipt') {
      return (
        <Chip
          label={order.inventoryId ? '已发货，待确认' : '待发货'}
          color="warning"
          size="small"
          {...props}
        />
      );
    }

    if (order.overdueStatus === 'overdue_use') {
      return <Chip label="超时使用" color="error" size="small" {...props} />;
    }
    if (order.overdueStatus === 'overdue') {
      return <Chip label="订单逾期" color="error" size="small" {...props} />;
    }

    if (order.payStatus === 'timeout') {
      return <Chip label="支付超时" size="small" {...props} />;
    }

    if (order.isInstallment && order.hasOverduePendingInstallment) {
      return <Chip label="已逾期" color="error" size="small" {...props} />;
    }

    if (order.useageStatus !== 'none' && !isEnd) {
      return (
        <Chip
          label={order.useageStatusLabel}
          color={getUseageStatusLabelColor(order.useageStatus)}
          size="small"
          {...props}
        />
      );
    }
  }
}

// 租客信息卡片
export function OrderLesseeInfoSection({ order }: Props) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Iconify icon="solar:user-linear" width={20} />
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          租客信息
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar src={order.lessee.avatar} sx={{ width: 56, height: 56 }} />
        <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {order.contactName || order.lessee.profile?.realName || order.lessee.username}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Iconify icon="solar:phone-bold" width={14} />
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', textDecoration: 'none' }}
                component="a"
                href={`tel:${order.lessee.phone}`}
              >
                {order.lessee.phone}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
// 订单状态卡片
export function OrderStatusSection({ order }: Props) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">订单状态</Typography>
        <Box flex={1} />
        <OrderStatusChip order={order} />
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        订单号：{order.orderNo}
      </Typography>
    </Box>
  );
}

// 分期信息卡片
export function OrderInstallmentSection({ order }: Props) {
  const router = useRouter();
  const progress = useMemo(() => (order.completedPeriodCount / order.rentalPeriod) * 100, [order]);
  const renderInstallmentProgress = () => (
    <Box sx={{ width: '100%', height: 8, borderRadius: 4, bgcolor: 'divider', overflow: 'hidden' }}>
      <Box
        component={m.div}
        initial={{ width: 0 }}
        animate={{
          width: `${progress}%`,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        sx={{
          height: '100%',
          bgcolor: order.isOverdue ? 'error.main' : progress >= 100 ? 'success.main' : 'info.main',
          borderRadius: 4,
        }}
      />
    </Box>
  );
  return (
    <>
      {/* 分期信息卡片（如果有） */}
      {order.isInstallment && (
        <OrderDetailPanel>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <CreditCard size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                分期支付
              </Typography>
            </Stack>
            <Button
              variant="contained"
              size="small"
              color={order.isOverdue ? 'error' : 'info'}
              onClick={() => router.push(paths.my.orderInstallments(order.id))}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              查看详情
              <Iconify icon="eva:arrow-ios-forward-fill" width={16} height={16} />
            </Button>
          </Stack>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                分期进度
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {order.completedPeriodCount}/{order.rentalPeriod}期
              </Typography>
            </Stack>
            {renderInstallmentProgress()}
            <Stack spacing={1}>
              <HorizontalStack justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  每期金额
                </Typography>
                <CurrencyTypography currency={order.rentalPlanSnapshot?.price} disableDivide />
              </HorizontalStack>
              <HorizontalStack justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  已支付
                </Typography>
                <CurrencyTypography currency={order.paidAmount} disableDivide />
              </HorizontalStack>
              <HorizontalStack justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  剩余待付
                </Typography>
                <CurrencyTypography
                  currency={order.unpaidRentalAmount}
                  disableDivide
                  fontSize={14}
                />
              </HorizontalStack>
            </Stack>
          </Stack>
        </OrderDetailPanel>
      )}
    </>
  );
}

// 时间线
export function OrderTimelineSection({ order }: Props) {
  return (
    <OrderDetailPanel>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Iconify icon="solar:clock-circle-outline" />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          订单时间
        </Typography>
      </Stack>
      <Stack spacing={1.5}>
        <TimeInfoItem label="下单时间" value={order.createdAt} />
        <TimeInfoItem label="支付时间" value={order.paidAt} />
        <TimeInfoItem label="申请退款时间" value={order.cancelRefundedAt} />
        <TimeInfoItem label="发货时间" value={order.deliveredAt} />
        <TimeInfoItem label="收货时间" value={order.receivedAt} />
        <TimeInfoItem label="归还时间" value={order.returnedAt} />
        <TimeInfoItem label="完成时间" value={order.completedAt} />
        <TimeInfoItem label="取消时间" value={order.canceledAt} />
        <TimeInfoItem label="退款时间" value={order.refundedAt} />
      </Stack>
    </OrderDetailPanel>
  );
}

// 收货信息
export function OrderShippingInfoSection({ order }: Props) {
  // if (!order.contactSnapshot) return null;
  return (
    <OrderDetailPanel>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <MapPin size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          收货信息
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Stack spacing={0} flex={1}>
          <HorizontalStack spacing={1}>
            <Avatar src={order.lessee.avatar} sx={{ width: 56, height: 56 }} />
            <Stack flex={1} spacing={0}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {order.contactName || order.lessee.profile?.realName || order.lessee.username}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', textDecoration: 'none' }}
                component="a"
                href={`tel:${order.lessee.phone}`}
              >
                {order.contactPhone}
              </Typography>
            </Stack>
          </HorizontalStack>

          {order.contactSnapshot && (
            <>
              <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {order.contactSnapshot.addressName}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {order.contactSnapshot.province}
                  {order.contactSnapshot.city}
                  {order.contactSnapshot.district}
                  {order.contactSnapshot.address}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </Stack>
    </OrderDetailPanel>
  );
}

// 备注信息
export function OrderUserRemarkSection({ order }: Props) {
  if (!order.userRemark) return null;
  return (
    <OrderDetailPanel>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <FileText size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          备注信息
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {order.userRemark}
      </Typography>
    </OrderDetailPanel>
  );
}

// 出租方地址信息
export function OrderLessorAddressInfoSection({ order }: Props) {
  const { openLocation } = useMapBridge();
  return (
    <Stack spacing={1}>
      <HorizontalStack spacing={0.5}>
        <Iconify icon="solar:user-id-bold" width={20} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {order.isProductPurchase ? '联系信息' : '出租方联系信息'}
        </Typography>
      </HorizontalStack>
      {/* 姓名/手机号 */}
      <HorizontalStack spacing={1}>
        <Avatar
          variant="circular"
          src={order.assetSnapshot.owner.avatar}
          sx={{
            width: 42,
            height: 42,
            border: (theme) => `2px solid ${theme.palette.primary.main}`,
          }}
        />
        <Box flex={1}>
          <Typography variant="body2" gutterBottom={false}>
            {order.assetSnapshot.contactName}
          </Typography>
          <Typography
            component="div"
            gutterBottom={false}
            variant="body2"
            sx={{ color: 'text.secondary' }}
            noWrap
          >
            {order.assetSnapshot.contactPhone}
          </Typography>
        </Box>
        <IconButton component="a" href={`tel:${order.lessee.phone}`}>
          <Iconify icon="solar:phone-bold" sx={{ color: 'primary.main' }} />
        </IconButton>
      </HorizontalStack>
      {/* 地址信息 */}
      <HorizontalStack
        direction="row"
        alignItems="center"
        spacing={1}
        onClick={() => {
          if (order.assetSnapshot) {
            openLocation({
              latitude: order.assetSnapshot.latitude,
              longitude: order.assetSnapshot.longitude,
              name: order.assetSnapshot.addressName,
              address: order.assetSnapshot.address,
            });
          }
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap title={order.assetSnapshot?.addressName || '-'}>
            {order.assetSnapshot?.addressName || '-'}
          </Typography>
          <Typography
            component="div"
            variant="caption"
            color="text.secondary"
            sx={(theme) => theme.mixins.maxLine({ line: 1 })}
            noWrap
            title={order.assetSnapshot?.address || '-'}
          >
            {order.assetSnapshot?.address || '-'}
          </Typography>
        </Box>
        <IconButton>
          <Iconify icon="custom:location-arrow-fill" sx={{ color: 'primary.main' }} />
        </IconButton>
      </HorizontalStack>
    </Stack>
  );
}

// 时间信息项组件
const TimeInfoItem = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2">{fDateTime(value)}</Typography>
    </Stack>
  );
};

{
  /* 物流信息卡片（如果有） */
}
{
  // order.logistics && (
  //   <Paper
  //     component={m.div}
  //     variants={varFade('inUp')}
  //     initial="initial"
  //     animate="animate"
  //     sx={{ p: 3, borderRadius: 2, boxShadow: (theme) => theme.customShadows.card }}
  //   >
  //     <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
  //       <Truck size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
  //       <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
  //         物流信息
  //       </Typography>
  //     </Stack>
  //     <Stack spacing={2}>
  //       <Stack direction="row" justifyContent="space-between">
  //         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
  //           快递公司
  //         </Typography>
  //         <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
  //           {order.logistics.company}
  //         </Typography>
  //       </Stack>
  //       <Stack direction="row" justifyContent="space-between">
  //         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
  //           运单号
  //         </Typography>
  //         <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
  //           {order.logistics.trackingNumber}
  //         </Typography>
  //       </Stack>
  //       <Stack direction="row" justifyContent="space-between">
  //         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
  //           物流状态
  //         </Typography>
  //         <Chip label={order.logistics.status} color="info" size="small" />
  //       </Stack>
  //       <Divider sx={{ my: 1 }} />
  //       <Stack spacing={2}>
  //         {order.logistics.timeline.map((item, index) => (
  //           <Stack key={index} direction="row" spacing={2}>
  //             <Box sx={{ position: 'relative', pt: 0.5 }}>
  //               <Box
  //                 sx={{
  //                   width: 10,
  //                   height: 10,
  //                   borderRadius: '50%',
  //                   bgcolor: index === 0 ? 'primary.main' : 'divider',
  //                   border: (theme) =>
  //                     `2px solid ${index === 0 ? theme.palette.primary.main : theme.palette.divider}`,
  //                 }}
  //               />
  //               {index < order.logistics!.timeline.length - 1 && (
  //                 <Box
  //                   sx={{
  //                     position: 'absolute',
  //                     top: 14,
  //                     left: '50%',
  //                     transform: 'translateX(-50%)',
  //                     width: 2,
  //                     height: 40,
  //                     bgcolor: 'divider',
  //                   }}
  //                 />
  //               )}
  //             </Box>
  //             <Stack
  //               spacing={0.5}
  //               sx={{
  //                 flexGrow: 1,
  //                 pb: index < order.logistics!.timeline.length - 1 ? 2 : 0,
  //               }}
  //             >
  //               <Typography
  //                 variant="body2"
  //                 sx={{ fontWeight: index === 0 ? 'bold' : 'normal' }}
  //               >
  //                 {item.description}
  //               </Typography>
  //               <Stack direction="row" spacing={1}>
  //                 <Typography variant="caption" sx={{ color: 'text.disabled' }}>
  //                   {item.time}
  //                 </Typography>
  //                 {item.location && (
  //                   <>
  //                     <Typography variant="caption" sx={{ color: 'text.disabled' }}>
  //                       |
  //                     </Typography>
  //                     <Typography variant="caption" sx={{ color: 'text.disabled' }}>
  //                       {item.location}
  //                     </Typography>
  //                   </>
  //                 )}
  //               </Stack>
  //             </Stack>
  //           </Stack>
  //         ))}
  //       </Stack>
  //     </Stack>
  //   </Paper>
  // )
}
