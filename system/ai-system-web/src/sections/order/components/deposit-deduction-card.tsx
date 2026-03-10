import dayjs from 'dayjs';
import { varAlpha } from 'minimal-shared/utils';
import { useDialogs } from '@toolpad/core/useDialogs';

import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  styled,
  Divider,
  Typography,
  type Theme,
} from '@mui/material';

import API from 'src/services/API';
import { ORDER_EVENT_NAME } from 'src/constants';

import { Iconify } from 'src/components/iconify';
import { MultiFilePreview } from 'src/components/upload';
import { CurrencyTypography } from 'src/components/custom';
import { HorizontalStack } from 'src/components/custom/layout';
import { FadeInPaper } from 'src/components/custom/fade-in-paper';
import { MyConfirmDialog } from 'src/components/custom/confirm-dialog';

import { OperationTimeoutCountdown } from 'src/sections/lessor/orders/components';

import { useAuthContext } from 'src/auth/hooks';

import { TimeInfoItem } from './time-item';
import { getDepositDeductionStatusLabelColor } from '../utils/order-status';
import { ConfirmDepositDeductionDialogForm } from '../confirm-deposit-deduction-dialog-form';

// ----------------------------------------------------------------------

type GetBgColorOptions = {
  disabeld: boolean;
  pendingAudit: boolean;
  approved: boolean;
};
const getBgColor = (theme: Theme, options: GetBgColorOptions, opacity = 0.1) => {
  const { disabeld, pendingAudit, approved } = options;
  if (disabeld) {
    return varAlpha(theme.vars.palette.grey['500Channel'], opacity);
  } else if (pendingAudit) {
    return varAlpha(theme.vars.palette.warning.mainChannel, opacity);
  } else if (approved) {
    return varAlpha(theme.vars.palette.success.mainChannel, opacity);
  }
  return varAlpha(theme.vars.palette.grey['500Channel'], opacity);
};

// ----------------------------------------------------------------------
type Props = {
  deduction: MyApi.OutputDepositDeductionDto;
  order: MyApi.OutputRentalOrderDto;
};
/**
 * 扣款记录项组件
 */
export function DepositDeductionCard({ deduction, order }: Props) {
  const { user } = useAuthContext();

  const { open: openDialog } = useDialogs();

  const deductionStatusColor = getDepositDeductionStatusLabelColor(deduction.status);

  const disabeld = deduction.status === 'cancelled';
  const approved =
    deduction.userResponseType === 'approved' || deduction.status === 'platform_approved';

  const userResponseRejected = deduction.userResponseType === 'rejected';

  return (
    <FadeInPaper
      sx={(theme) => ({
        p: 2,
        borderRadius: 1.5,
        border: `1px solid ${theme.vars.palette.divider}`,
        bgcolor: getBgColor(theme, {
          disabeld,
          pendingAudit: deduction.status === 'pending_audit',
          approved,
        }),
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: theme.customShadows.z8,
          transform: 'translateY(-2px)',
        },
      })}
    >
      <Stack spacing={1.5}>
        {deduction.status === 'pending_user_confirm' && order.lesseeId === user?.id && (
          <Alert severity="warning">
            超时未处理将由平台审核处理
            <OperationTimeoutCountdown
              seconds={dayjs(deduction.timeoutAt).diff(dayjs(), 'seconds')}
              enabled
              showIcon={false}
              slotProps={{
                typography: {
                  component: 'div',
                  variant: 'body2',
                  fontWeight: 700,
                },
              }}
              onCountdownEnd={() => {
                window.dispatchEvent(
                  new CustomEvent(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER, { detail: deduction })
                );
              }}
            />
          </Alert>
        )}

        {/* 扣款单号、状态 */}
        {deduction.deductionNo && (
          <HorizontalStack justifyContent="space-between" spacing={0.5}>
            {/* 扣款单号 */}
            <Typography
              variant="subtitle2"
              sx={{
                color: disabeld ? 'text.disabled' : undefined,
                fontFamily: 'monospace',
              }}
            >
              单号:{deduction.deductionNo}
            </Typography>
            {/* 用户响应状态 */}
            <HorizontalStack spacing={1} justifyContent="flex-end">
              {deduction.userResponseType === 'approved' ? (
                <Chip
                  label="已扣款"
                  size="small"
                  color="success"
                  sx={{ borderRadius: 0.5, fontWeight: 600 }}
                />
              ) : (
                <Chip
                  label={deduction.statusLabel}
                  size="small"
                  color={deductionStatusColor}
                  sx={{ borderRadius: 0.5, fontWeight: 600 }}
                />
              )}
            </HorizontalStack>
          </HorizontalStack>
        )}

        {/* ------------------------------------------------------------------------------------------------ */}

        {/* 出租方申请信息 */}
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <EvidenceStack
            deduction={deduction}
            title={deduction.reason}
            description={deduction.description || '未填写描述'}
            urls={deduction.evidence.urls}
            chip={
              <CurrencyTypography
                currency={deduction.amount}
                color={disabeld ? 'text.disabled' : 'error.main'}
                // disableDivide
                isNegative
                slotProps={{
                  integer: {},
                }}
              />
            }
          />
          {/* 时间信息 */}
          <HorizontalStack justifyContent="space-between">
            <Stack spacing={1} sx={{ flex: 1 }}>
              {deduction.appliedAt && (
                <TimeInfoItem label="申请扣款时间" value={deduction.appliedAt} />
              )}
              {deduction.cancelAt && <TimeInfoItem label="撤销时间" value={deduction.cancelAt} />}

              {deduction.deductedAt && (
                <TimeInfoItem label="扣款时间" value={deduction.deductedAt} />
              )}
            </Stack>
            {deduction.operatorName && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:user-id-bold" width={14} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {deduction.operatorName}
                </Typography>
              </Stack>
            )}
          </HorizontalStack>
        </Stack>

        {/* 用户响应信息 */}
        {deduction.userResponseType && (
          <>
            <Divider />
            <Stack spacing={1.5} sx={{ flex: 1 }}>
              <EvidenceStack
                deduction={deduction}
                title="用户回复"
                description={
                  userResponseRejected
                    ? deduction.userResponseDescription || '未填写描述'
                    : '用户同意扣款'
                }
                urls={deduction.userResponseEvidence?.urls}
                chip={
                  <Chip
                    label={userResponseRejected ? '用户拒绝' : '用户同意'}
                    size="small"
                    color={userResponseRejected ? 'error' : 'success'}
                    sx={{ borderRadius: 0.5, fontWeight: 600 }}
                  />
                }
              />
              {/* 响应时间 */}
              <TimeInfoItem label="响应时间" value={deduction.userRespondedAt} />
            </Stack>
          </>
        )}
      </Stack>

      {/* 操作按钮 */}
      <Box>
        {
          // 承租方可以同意或拒绝扣款
          order.lesseeId === user?.id && deduction.status === 'pending_user_confirm' && (
            <>
              <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
              <HorizontalStack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Box flex={1} />
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => {
                    openDialog(ConfirmDepositDeductionDialogForm, {
                      orderId: order.id,
                      deductionId: deduction.id,
                      responseType: 'approved',
                      onSuccess: () => {
                        window.dispatchEvent(
                          new CustomEvent(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER, {
                            detail: deduction,
                          })
                        );
                      },
                    });
                  }}
                >
                  同意扣款
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => {
                    openDialog(ConfirmDepositDeductionDialogForm, {
                      orderId: order.id,
                      deductionId: deduction.id,
                      responseType: 'rejected',
                      onSuccess: () => {
                        window.dispatchEvent(
                          new CustomEvent(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER, {
                            detail: deduction,
                          })
                        );
                      },
                    });
                  }}
                >
                  拒绝扣款
                </Button>
              </HorizontalStack>
            </>
          )
        }

        {
          // 出租方可以取消扣款
          order.lessorId === user?.id &&
            (deduction.status === 'pending_user_confirm' ||
              deduction.status === 'pending_audit') && (
              <>
                <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
                <HorizontalStack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Box flex={1} />
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => {
                      openDialog(MyConfirmDialog, {
                        title: '撤销本次扣款申请',
                        content: '确定撤销当前扣款申请？撤销后本次申请将作废，请谨慎操作！',
                        loadingText: '正在撤销...',
                        onOk: async () => {
                          await API.AppRentalOrderLessor.AppRentalOrderLessorControllerCancelDepositDeductionV1(
                            { id: order.id },
                            {
                              deductionId: deduction.id,
                              cancelReason: '出租方撤销本次押金扣款申请',
                            },
                            {
                              fetchOptions: { useApiMessage: true },
                            }
                          );
                          window.dispatchEvent(
                            new CustomEvent(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER, {
                              detail: deduction,
                            })
                          );
                        },
                      });
                    }}
                  >
                    取消扣款
                  </Button>
                </HorizontalStack>
              </>
            )
        }
      </Box>
    </FadeInPaper>
  );
}

export function EvidenceStack({
  deduction,
  chip,
  title,
  description,
  urls = [],
}: {
  deduction: MyApi.OutputDepositDeductionDto;
  chip?: React.ReactNode;
  title: string;
  description: string;
  urls?: string[];
}) {
  const disabeld = deduction.status === 'cancelled';
  const approved =
    deduction.userResponseType === 'approved' || deduction.status === 'platform_approved';
  return (
    <Stack>
      <HorizontalStack spacing={1}>
        <StatusDot
          pendingAudit={deduction.status === 'pending_audit'}
          disabeld={disabeld}
          approved={approved}
        />

        <Typography variant="subtitle2" sx={{ flex: 1, wordBreak: 'break-all' }}>
          {title}
        </Typography>

        {chip}
      </HorizontalStack>

      {description && (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', pl: 2.5, wordBreak: 'break-all' }}
        >
          {description}
        </Typography>
      )}
      {/* 出租方申请凭证图片 */}
      {!!urls?.length && <MultiFilePreview files={urls} sx={{ mt: 1 }} />}
    </Stack>
  );
}

const StatusDot = styled(Box, {
  shouldForwardProp: (prop: string) => !['pendingAudit', 'disabeld', 'approved'].includes(prop),
})<GetBgColorOptions>(({ theme, pendingAudit, disabeld, approved }) => ({
  width: 10,
  height: 10,
  ml: 0.5,
  borderRadius: '50%',
  backgroundColor: getBgColor(theme, { disabeld, pendingAudit, approved }, 1),
  boxShadow: `0 0 0 4px ${getBgColor(theme, { disabeld, pendingAudit, approved }, 0.16)}`,
}));
