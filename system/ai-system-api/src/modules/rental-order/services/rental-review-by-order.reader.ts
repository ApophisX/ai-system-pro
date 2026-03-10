import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { RentalReviewPermissionInput } from '@/common/utils/rental-review-permission.util';

const RENTAL_REVIEW_TABLE = 'rental_review';

/**
 * 租赁评价按订单读取器（解耦版）
 *
 * 供订单模块查询评价信息以计算 canReview/canReplyToReview，
 * 不依赖 Reviews 模块，避免循环引用。
 */
@Injectable()
export class RentalReviewByOrderReader {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * 批量按订单 ID 查询评价（仅 orderId、status、replyContent）
   */
  async findByOrderIds(orderIds: string[]): Promise<RentalReviewPermissionInput[]> {
    if (orderIds.length === 0) return [];

    const rows = await this.dataSource
      .createQueryBuilder()
      .select('r.order_id', 'orderId')
      .addSelect('r.status', 'status')
      .addSelect('r.reply_content', 'replyContent')
      .from(RENTAL_REVIEW_TABLE, 'r')
      .where('r.order_id IN (:...orderIds)', { orderIds })
      .andWhere('(r.deleted_at IS NULL)')
      .getRawMany<{ orderId: string; status: string; replyContent: string | null }>();

    return rows.map(r => ({
      orderId: r.orderId,
      status: r.status,
      replyContent: r.replyContent,
    }));
  }

  /**
   * 按单个订单 ID 查询评价
   */
  async findByOrderId(orderId: string): Promise<RentalReviewPermissionInput | null> {
    const rows = await this.findByOrderIds([orderId]);
    return rows[0] ?? null;
  }
}
