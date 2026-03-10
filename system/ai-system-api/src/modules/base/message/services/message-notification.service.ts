import { Injectable, Logger } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageType } from '../enums/message-type.enum';
import { CreateMessageDto } from '../dto/create-message.dto';
import { RentalOrderEntity } from '@/modules/rental-order/entities';
import { DepositEntity, DepositDeductionEntity } from '@/modules/rental-order/entities';
import { PaymentRecordEntity, RefundRecordEntity, PaymentEntity } from '@/modules/base/payment/entities';
import Decimal from 'decimal.js';
import { RentalOrderOverdueStatus } from '@/modules/rental-order/enums';

/**
 * 消息通知服务
 *
 * 提供订单、支付、退款、押金、资产实例绑定等场景的消息创建功能
 * 确保消息正确关联到出租方和承租方
 */
@Injectable()
export class MessageNotificationService {
  private readonly logger = new Logger(MessageNotificationService.name);

  constructor(private readonly messageService: MessageService) {}

  /**
   * 发送订单创建消息
   * 通知出租方有新订单
   */
  async notifyOrderCreated(order: RentalOrderEntity): Promise<void> {
    try {
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.ORDER,
        title: '新订单通知',
        content: `您收到一个新的租赁订单，订单号：${order.orderNo}，请及时处理。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          orderNo: order.orderNo,
          orderId: order.id,
          assetName: order.assetSnapshot?.name || '未知资产',
          totalAmount: order.totalAmount,
        },
      });

      this.logger.log(`订单创建消息已发送: orderNo=${order.orderNo}, lessorId=${order.lessorId}`);
    } catch (error) {
      this.logger.error(
        `发送订单创建消息失败: orderNo=${order.orderNo}, lessorId=${order.lessorId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送订单支付完成消息
   * 通知出租方和承租方支付已完成
   */
  async notifyPaymentCompleted(order: RentalOrderEntity, paymentRecord: PaymentRecordEntity): Promise<void> {
    try {
      const paymentAmount = new Decimal(paymentRecord.amount).toNumber();
      const isFirstPeriod = paymentRecord.payment?.periodIndex === 1;

      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.PAYMENT,
        title: isFirstPeriod ? '支付成功' : `第${paymentRecord.payment?.periodIndex}期租金支付成功`,
        content: isFirstPeriod
          ? `您的订单 ${order.orderNo} 支付成功，支付金额：¥${paymentAmount}。${order.inventory ? '祝您体验愉快，如有疑问请及时联系出租方。' : '请耐心等待商家发货，如有问题可与客服联系。'}`
          : `您的订单 ${order.orderNo} 第${paymentRecord.payment?.periodIndex}期租金支付成功，金额：¥${paymentAmount}。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          paymentNo: paymentRecord.paymentNo,
          amount: paymentAmount,
        },
      });

      // 通知出租方（仅首期支付时通知）
      if (isFirstPeriod) {
        await this.messageService.create({
          userId: order.lessorId,
          type: MessageType.PAYMENT,
          title: '订单支付成功',
          content: `订单 ${order.orderNo} 已支付成功，金额：¥${paymentAmount}，${order.inventory ? `资产实例编号：${order.inventory.instanceCode}` : '请及时绑定资产实例并发货'}。`,
          relatedId: order.id,
          relatedType: 'ORDER',
          extra: {
            orderNo: order.orderNo,
            orderId: order.id,
            lessorId: order.lessorId,
            lesseeId: order.lesseeId,
            paymentNo: paymentRecord.paymentNo,
            amount: paymentAmount,
          },
        });
      }

      this.logger.log(
        `支付完成消息已发送: orderNo=${order.orderNo}, paymentNo=${paymentRecord.paymentNo}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送支付完成消息失败: orderNo=${order.orderNo}, paymentNo=${paymentRecord.paymentNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送续租支付完成消息
   * 通知出租方和承租方续租支付已完成
   */
  async notifyRenewalPaymentCompleted(order: RentalOrderEntity, paymentRecord: PaymentRecordEntity): Promise<void> {
    try {
      const paymentAmount = new Decimal(paymentRecord.amount).toNumber();

      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.PAYMENT,
        title: '续租支付成功',
        content: `您的订单 ${order.orderNo} 续租支付成功，金额：¥${paymentAmount}，租期已延长。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          paymentNo: paymentRecord.paymentNo,
          amount: paymentAmount,
        },
      });

      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.PAYMENT,
        title: '订单续租成功',
        content: `订单 ${order.orderNo} 承租方已完成续租支付，金额：¥${paymentAmount}。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          paymentNo: paymentRecord.paymentNo,
          amount: paymentAmount,
        },
      });

      this.logger.log(`续租支付完成消息已发送: orderNo=${order.orderNo}, paymentNo=${paymentRecord.paymentNo}`);
    } catch (error) {
      this.logger.error(
        `发送续租支付完成消息失败: orderNo=${order.orderNo}, paymentNo=${paymentRecord.paymentNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送支付超时消息
   * 通知承租方支付超时
   */
  async notifyPaymentTimeout(order: RentalOrderEntity): Promise<void> {
    try {
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.ORDER,
        title: '支付超时',
        content: `您的订单 ${order.orderNo} 支付超时，订单已自动取消。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          orderId: order.id,
          orderNo: order.orderNo,
        },
      });

      this.logger.log(`支付超时消息已发送: orderNo=${order.orderNo}, lesseeId=${order.lesseeId}`);
    } catch (error) {
      this.logger.error(`发送支付超时消息失败: orderNo=${order.orderNo}`, error instanceof Error ? error.stack : error);
    }
  }

  /**
   * 发送资产实例绑定消息
   * 通知承租方资产已绑定，可以确认收货
   */
  async notifyAssetInventoryBound(order: RentalOrderEntity, inventoryId: string): Promise<void> {
    try {
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.ASSET,
        title: '资产已绑定',
        content: `订单 ${order.orderNo} 的资产实例已绑定，请及时确认收货。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          orderNo: order.orderNo,
          orderId: order.id,
          inventoryId,
        },
      });

      this.logger.log(
        `资产实例绑定消息已发送: orderNo=${order.orderNo}, inventoryId=${inventoryId}, lesseeId=${order.lesseeId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送资产实例绑定消息失败: orderNo=${order.orderNo}, inventoryId=${inventoryId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送资产实例换绑消息
   * 通知承租方资产实例已换绑，便于前端刷新展示
   */
  async notifyAssetInventoryRebound(order: RentalOrderEntity, newInventoryId: string): Promise<void> {
    try {
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.ASSET,
        title: '资产实例已换绑',
        content: `订单 ${order.orderNo} 的资产实例已更换，请知悉。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          orderNo: order.orderNo,
          orderId: order.id,
          inventoryId: newInventoryId,
        },
      });

      this.logger.log(
        `资产实例换绑消息已发送: orderNo=${order.orderNo}, newInventoryId=${newInventoryId}, lesseeId=${order.lesseeId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送资产实例换绑消息失败: orderNo=${order.orderNo}, newInventoryId=${newInventoryId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送资产审核结果消息
   * 通知出租方资产审核通过或拒绝
   */
  async notifyAssetAudit(
    ownerId: string,
    assetId: string,
    assetName: string,
    approved: boolean,
    auditRemark?: string,
  ): Promise<void> {
    try {
      const title = approved ? '资产审核通过' : '资产审核未通过';
      const content = approved
        ? `您的资产「${assetName}」已通过平台审核，现已可对外展示。`
        : `您的资产「${assetName}」未通过平台审核。${auditRemark ? `审核意见：${auditRemark}` : '请修改后重新提交审核。'}`;

      await this.messageService.create({
        userId: ownerId,
        type: MessageType.ASSET,
        title,
        content,
        relatedId: assetId,
        relatedType: 'ASSET',
        extra: {
          assetId,
          assetName,
          approved,
          auditRemark,
        },
      });

      this.logger.log(`资产审核消息已发送: assetId=${assetId}, ownerId=${ownerId}, approved=${approved}`);
    } catch (error) {
      this.logger.error(
        `发送资产审核消息失败: assetId=${assetId}, ownerId=${ownerId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送资产强制下架消息
   * 通知出租方平台已强制下架其资产
   */
  async notifyAssetForceOffline(ownerId: string, assetId: string, assetName: string, reason?: string): Promise<void> {
    try {
      const content = reason
        ? `您的资产「${assetName}」已被平台强制下架。原因：${reason}`
        : `您的资产「${assetName}」已被平台强制下架，如有疑问请联系平台客服。`;

      await this.messageService.create({
        userId: ownerId,
        type: MessageType.ASSET,
        title: '资产已强制下架',
        content,
        relatedId: assetId,
        relatedType: 'ASSET',
        extra: {
          assetId,
          assetName,
          reason,
        },
      });

      this.logger.log(`资产强制下架消息已发送: assetId=${assetId}, ownerId=${ownerId}`);
    } catch (error) {
      this.logger.error(
        `发送资产强制下架消息失败: assetId=${assetId}, ownerId=${ownerId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送确认收货消息
   * 通知出租方承租方已确认收货，订单进入使用中
   */
  async notifyReceiptConfirmed(order: RentalOrderEntity): Promise<void> {
    try {
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.ORDER,
        title: '承租方已确认收货',
        content: `订单 ${order.orderNo} 的承租方已确认收货，订单已进入使用中状态。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
        },
      });

      this.logger.log(`确认收货消息已发送: orderNo=${order.orderNo}, lessorId=${order.lessorId}`);
    } catch (error) {
      this.logger.error(`发送确认收货消息失败: orderNo=${order.orderNo}`, error instanceof Error ? error.stack : error);
    }
  }

  /**
   * 发送押金支付完成消息
   * 通知出租方和承租方押金支付已完成
   */
  async notifyDepositPaid(order: RentalOrderEntity, deposit: DepositEntity): Promise<void> {
    try {
      const depositAmount = new Decimal(deposit.amount).toNumber();

      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.PAYMENT,
        title: '押金支付成功',
        content: `您的订单 ${order.orderNo} 押金支付成功，金额：¥${depositAmount}。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          depositNo: deposit.depositNo,
          amount: depositAmount,
        },
      });

      // 通知出租方
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.PAYMENT,
        title: '押金支付成功',
        content: `订单 ${order.orderNo} 的押金已支付成功，金额：¥${depositAmount}。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          depositNo: deposit.depositNo,
          amount: depositAmount,
        },
      });

      this.logger.log(
        `押金支付完成消息已发送: orderNo=${order.orderNo}, depositNo=${deposit.depositNo}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送押金支付完成消息失败: orderNo=${order.orderNo}, depositNo=${deposit.depositNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送押金扣款申请消息
   * 通知承租方有押金扣款申请需要确认
   */
  async notifyDepositDeductionApplied(order: RentalOrderEntity, deduction: DepositDeductionEntity): Promise<void> {
    try {
      const deductionAmount = new Decimal(deduction.amount).toNumber();

      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.PAYMENT,
        title: '押金扣款申请',
        content: `订单 ${order.orderNo} 有押金扣款申请，金额：¥${deductionAmount}，原因：${deduction.reason || '无'}，请在72小时内确认。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          deductionNo: deduction.deductionNo,
          amount: deductionAmount,
          reason: deduction.reason,
        },
      });

      this.logger.log(
        `押金扣款申请消息已发送: orderNo=${order.orderNo}, deductionNo=${deduction.deductionNo}, lesseeId=${order.lesseeId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送押金扣款申请消息失败: orderNo=${order.orderNo}, deductionNo=${deduction.deductionNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送押金扣款确认消息
   * 通知出租方承租方已确认扣款
   */
  async notifyDepositDeductionConfirmed(order: RentalOrderEntity, deduction: DepositDeductionEntity): Promise<void> {
    try {
      const deductionAmount = new Decimal(deduction.amount).toNumber();

      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.PAYMENT,
        title: '押金扣款已确认',
        content: `订单 ${order.orderNo} 的押金扣款申请已确认，审核意见：${deduction.platformAuditDescription || '无'}，金额：¥${deductionAmount}。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          deductionNo: deduction.deductionNo,
          amount: deductionAmount,
        },
      });

      this.logger.log(
        `押金扣款确认消息已发送: orderNo=${order.orderNo}, deductionNo=${deduction.deductionNo}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送押金扣款确认消息失败: orderNo=${order.orderNo}, deductionNo=${deduction.deductionNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送押金扣款拒绝消息
   * 通知出租方承租方已拒绝扣款
   */
  async notifyDepositDeductionRejected(order: RentalOrderEntity, deduction: DepositDeductionEntity): Promise<void> {
    try {
      const deductionAmount = new Decimal(deduction.amount).toNumber();

      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.PAYMENT,
        title: '押金扣款被拒绝',
        content: `订单 ${order.orderNo} 的押金扣款申请被拒绝，金额：¥${deductionAmount}，将进入平台审核流程。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          deductionNo: deduction.deductionNo,
          amount: deductionAmount,
        },
      });

      this.logger.log(
        `押金扣款拒绝消息已发送: orderNo=${order.orderNo}, deductionNo=${deduction.deductionNo}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送押金扣款拒绝消息失败: orderNo=${order.orderNo}, deductionNo=${deduction.deductionNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送押金扣款平台审核拒绝消息
   * 通知出租方：平台审核未通过其押金扣款申请
   */
  async notifyDepositDeductionPlatformRejected(
    order: RentalOrderEntity,
    deduction: DepositDeductionEntity,
  ): Promise<void> {
    try {
      const deductionAmount = new Decimal(deduction.amount).toNumber();
      const reason = deduction.platformAuditDescription ? `，原因：${deduction.platformAuditDescription}` : '';

      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.PAYMENT,
        title: '押金扣款审核未通过',
        content: `订单 ${order.orderNo} 的押金扣款申请经平台审核未通过，金额：¥${deductionAmount}${reason}。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          deductionNo: deduction.deductionNo,
          amount: deductionAmount,
          platformAuditDescription: deduction.platformAuditDescription,
        },
      });

      this.logger.log(
        `押金扣款平台审核拒绝消息已发送: orderNo=${order.orderNo}, deductionNo=${deduction.deductionNo}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送押金扣款平台审核拒绝消息失败: orderNo=${order.orderNo}, deductionNo=${deduction.deductionNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送押金退款消息
   * 通知出租方和承租方押金已退款
   */
  async notifyDepositRefunded(order: RentalOrderEntity, deposit: DepositEntity): Promise<void> {
    try {
      const refundAmount = new Decimal(deposit.amount).minus(deposit.deductedAmount).toNumber();

      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.PAYMENT,
        title: '押金已退款',
        content: `您的订单 ${order.orderNo} 押金已退款，退款金额：¥${refundAmount}，请查收。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          depositNo: deposit.depositNo,
          refundNo: deposit.refundNo,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          amount: refundAmount,
        },
      });

      // 通知出租方
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.PAYMENT,
        title: '押金已退款',
        content: `订单 ${order.orderNo} 的押金已退款给承租方，退款金额：¥${refundAmount}。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          depositNo: deposit.depositNo,
          refundNo: deposit.refundNo,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          amount: refundAmount,
        },
      });

      this.logger.log(
        `押金退款消息已发送: orderNo=${order.orderNo}, depositNo=${deposit.depositNo}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送押金退款消息失败: orderNo=${order.orderNo}, depositNo=${deposit.depositNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送租金退款消息
   * 通知出租方和承租方租金已退款
   */
  async notifyRentRefunded(order: RentalOrderEntity, refundRecord: RefundRecordEntity): Promise<void> {
    try {
      const refundAmount = new Decimal(refundRecord.amount).toNumber();

      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.PAYMENT,
        title: '租金已退款',
        content: `您的订单 ${order.orderNo} 租金已退款，退款金额：¥${refundAmount}，原因：${refundRecord.reason || '无'}，请查收。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          refundNo: refundRecord.refundNo,
          amount: refundAmount,
          reason: refundRecord.reason,
        },
      });

      // 通知出租方
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.PAYMENT,
        title: '租金已退款',
        content: `订单 ${order.orderNo} 的租金已退款给承租方，退款金额：¥${refundAmount}，原因：${refundRecord.reason || '无'}。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          refundNo: refundRecord.refundNo,
          amount: refundAmount,
          reason: refundRecord.reason,
        },
      });

      this.logger.log(
        `租金退款消息已发送: orderNo=${order.orderNo}, refundNo=${refundRecord.refundNo}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送租金退款消息失败: orderNo=${order.orderNo}, refundNo=${refundRecord.refundNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送订单取消消息
   * 通知出租方和承租方订单已取消
   */
  async notifyOrderCanceled(
    order: RentalOrderEntity,
    cancelReason: string,
    canceledBy: 'lessee' | 'lessor' | 'system',
  ): Promise<void> {
    try {
      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.ORDER,
        title: '订单已取消',
        content: `您的订单 ${order.orderNo} 已取消，原因：${cancelReason || '无'}。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          cancelReason,
          canceledBy,
        },
      });

      // 通知出租方
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.ORDER,
        title: '订单已取消',
        content: `订单 ${order.orderNo} 已取消，${canceledBy === 'lessee' ? '承租方申请取消' : canceledBy === 'lessor' ? '您已同意取消' : '系统自动取消'}，原因：${cancelReason || '无'}。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          cancelReason,
          canceledBy,
        },
      });

      this.logger.log(
        `订单取消消息已发送: orderNo=${order.orderNo}, cancelReason=${cancelReason}, canceledBy=${canceledBy}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(`发送订单取消消息失败: orderNo=${order.orderNo}`, error instanceof Error ? error.stack : error);
    }
  }

  /**
   * 发送订单取消申请消息
   * 通知出租方有取消申请需要处理
   */
  async notifyOrderCancelRequested(order: RentalOrderEntity, cancelReason: string): Promise<void> {
    try {
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.ORDER,
        title: '订单取消申请',
        content: `订单 ${order.orderNo} 有取消申请，原因：${cancelReason || '无'}，请在24小时内处理。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          cancelReason,
        },
      });

      this.logger.log(
        `订单取消申请消息已发送: orderNo=${order.orderNo}, cancelReason=${cancelReason}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送订单取消申请消息失败: orderNo=${order.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送归还申请消息
   * 通知出租方承租方已提交归还申请，需在24小时内确认
   */
  async notifyOrderReturnRequested(order: RentalOrderEntity): Promise<void> {
    try {
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.ORDER,
        title: '归还申请待确认',
        content: `订单 ${order.orderNo} 的承租方已提交归还申请，请在24小时内确认归还或发起异议。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
        },
      });

      this.logger.log(`归还申请消息已发送: orderNo=${order.orderNo}, lessorId=${order.lessorId}`);
    } catch (error) {
      this.logger.error(`发送归还申请消息失败: orderNo=${order.orderNo}`, error instanceof Error ? error.stack : error);
    }
  }

  /**
   * 发送归还申请被拒绝消息
   * 通知承租方出租方已拒绝归还申请，订单进入争议
   */
  async notifyOrderReturnRejected(order: RentalOrderEntity, rejectReason: string): Promise<void> {
    try {
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.ORDER,
        title: '归还申请被拒绝',
        content: `订单 ${order.orderNo} 的归还申请已被出租方拒绝，原因：${rejectReason || '无'}，订单已进入争议状态，等待平台仲裁。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          rejectReason,
        },
      });

      this.logger.log(`归还申请拒绝消息已发送: orderNo=${order.orderNo}, lesseeId=${order.lesseeId}`);
    } catch (error) {
      this.logger.error(
        `发送归还申请拒绝消息失败: orderNo=${order.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送订单确认归还消息
   * 通知出租方和承租方资产已确认归还
   */
  async notifyOrderReturnConfirmed(order: RentalOrderEntity): Promise<void> {
    try {
      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.ORDER,
        title: '资产已确认归还',
        content: `您的订单 ${order.orderNo} 资产已确认归还，订单即将完成。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
        },
      });

      // 通知出租方
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.ORDER,
        title: '资产已确认归还',
        content: `订单 ${order.orderNo} 的资产已确认归还，订单即将完成。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
        },
      });

      this.logger.log(
        `订单确认归还消息已发送: orderNo=${order.orderNo}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送订单确认归还消息失败: orderNo=${order.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送订单即将到期提醒（逾期前30分钟）
   * 通知承租方和出租方：租期即将在30分钟后到期，请及时归还
   * extra.reminderType = 'order_due_30min' 用于去重
   */
  async notifyOrderDueSoon(order: RentalOrderEntity): Promise<void> {
    try {
      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.ORDER,
        title: '租期即将到期',
        content: `您的订单 ${order.orderNo} 将在30分钟后到期，请及时归还资产以免产生额外费用。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          reminderType: 'order_due_30min',
        },
      });

      // 通知出租方
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.ORDER,
        title: '租期即将到期',
        content: `订单 ${order.orderNo} 将在30分钟后到期，请提醒承租方及时归还。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          reminderType: 'order_due_30min',
        },
      });

      this.logger.log(
        `订单即将到期提醒已发送: orderNo=${order.orderNo}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送订单即将到期提醒失败: orderNo=${order.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送订单逾期/超时每日提醒
   * 通知承租方和出租方：订单已逾期或超时使用，请尽快处理
   * extra.reminderType = 'order_overdue_daily' 用于去重（每日每订单仅一条）
   */
  async notifyOrderOverdueDaily(order: RentalOrderEntity): Promise<void> {
    const title = order.overdueStatus === RentalOrderOverdueStatus.OVERDUE_USE ? '订单超时使用提醒' : '订单逾期提醒';
    const label = order.overdueStatus === RentalOrderOverdueStatus.OVERDUE_USE ? '超时使用' : '逾期';

    try {
      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.ORDER,
        title,
        content: `您的订单 ${order.orderNo} 已${label}，请尽快归还资产并支付相关费用。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          reminderType: 'order_overdue_daily',
        },
      });

      // 通知出租方
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.ORDER,
        title,
        content: `订单 ${order.orderNo} 已${label}，请跟进承租方尽快归还。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          reminderType: 'order_overdue_daily',
        },
      });

      this.logger.log(
        `订单逾期每日提醒已发送: orderNo=${order.orderNo}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送订单逾期每日提醒失败: orderNo=${order.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送订单逾期消息（租期逾期）
   * 通知出租方和承租方：租期已到期但未归还，订单已标记为逾期
   */
  async notifyOrderOverdue(order: RentalOrderEntity): Promise<void> {
    try {
      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.ORDER,
        title: '订单已逾期',
        content: `您的订单 ${order.orderNo} 已逾期，租期已到但尚未归还资产，请尽快归还以免产生额外费用。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
        },
      });

      // 通知出租方
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.ORDER,
        title: '订单已逾期',
        content: `订单 ${order.orderNo} 已逾期，承租方未在租期内归还资产，请注意跟进。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
        },
      });

      this.logger.log(
        `订单逾期消息已发送: orderNo=${order.orderNo}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(`发送订单逾期消息失败: orderNo=${order.orderNo}`, error instanceof Error ? error.stack : error);
    }
  }

  /**
   * 发送分期账单逾期消息
   * 通知出租方和承租方：分期账单已逾期未支付
   */
  async notifyInstallmentBillOverdue(order: RentalOrderEntity, periodIndex: number, paymentNo: string): Promise<void> {
    try {
      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.PAYMENT,
        title: '分期账单已逾期',
        content: `您的订单 ${order.orderNo} 第${periodIndex}期租金已逾期，请尽快支付以免影响信用。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          periodIndex,
          paymentNo,
        },
      });

      // 通知出租方
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.PAYMENT,
        title: '分期账单已逾期',
        content: `订单 ${order.orderNo} 第${periodIndex}期租金已逾期，承租方未按时支付，请注意跟进。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
          periodIndex,
          paymentNo,
        },
      });

      this.logger.log(
        `分期账单逾期消息已发送: orderNo=${order.orderNo}, periodIndex=${periodIndex}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送分期账单逾期消息失败: orderNo=${order.orderNo}, periodIndex=${periodIndex}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送分期待支付账单支付提醒
   * 通知承租方：当日应付的分期账单待支付，请及时支付
   */
  async notifyInstallmentBillPaymentReminder(payment: PaymentEntity, reminderHour: 9 | 12): Promise<void> {
    try {
      const amount = new Decimal(payment.amount).toNumber();
      const reminderType = `installment_bill_pending_${reminderHour}`;

      await this.messageService.create({
        userId: payment.userId,
        type: MessageType.PAYMENT,
        title: '分期账单待支付提醒',
        content: `您的订单 ${payment.orderNo} 第${payment.periodIndex}期租金待支付，金额：¥${amount}，请及时支付。`,
        relatedId: payment.orderId,
        relatedType: 'ORDER',
        extra: {
          orderNo: payment.orderNo,
          orderId: payment.orderId,
          lessorId: payment.lessorId,
          lesseeId: payment.userId,
          paymentId: payment.id,
          paymentNo: payment.paymentNo,
          periodIndex: payment.periodIndex,
          amount,
          reminderType,
        },
      });

      this.logger.log(
        `分期待支付账单提醒已发送: orderNo=${payment.orderNo}, periodIndex=${payment.periodIndex}, reminderHour=${reminderHour}, lesseeId=${payment.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `发送分期待支付账单提醒失败: orderNo=${payment.orderNo}, periodIndex=${payment.periodIndex}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * 发送订单完成消息
   * 通知出租方和承租方订单已完成
   */
  async notifyOrderCompleted(order: RentalOrderEntity): Promise<void> {
    try {
      // 通知承租方
      await this.messageService.create({
        userId: order.lesseeId,
        type: MessageType.ORDER,
        title: '订单已完成',
        content: `您的订单 ${order.orderNo} 已完成，感谢您的使用。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
        },
      });

      // 通知出租方
      await this.messageService.create({
        userId: order.lessorId,
        type: MessageType.ORDER,
        title: '订单已完成',
        content: `订单 ${order.orderNo} 已完成，感谢您的服务。`,
        relatedId: order.id,
        relatedType: 'ORDER',
        extra: {
          orderNo: order.orderNo,
          orderId: order.id,
          lessorId: order.lessorId,
          lesseeId: order.lesseeId,
        },
      });

      this.logger.log(
        `订单完成消息已发送: orderNo=${order.orderNo}, lesseeId=${order.lesseeId}, lessorId=${order.lessorId}`,
      );
    } catch (error) {
      this.logger.error(`发送订单完成消息失败: orderNo=${order.orderNo}`, error instanceof Error ? error.stack : error);
    }
  }
}
