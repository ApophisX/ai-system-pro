import { Entity, Index, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { RentalReviewStatus } from '../enums';
import { RentalOrderEntity } from '@/modules/rental-order/entities/rental-order.entity';

/**
 * 租赁评价实体
 *
 * 承租方对已完成租赁订单的评价，一单一评，需审核通过后公开展示
 */
@Entity('rental_review')
@Index('uk_order_review', ['orderId'], { unique: true })
@Index('IDX_rental_review_asset_status', ['assetId', 'status'])
@Index('IDX_rental_review_lessee', ['lesseeId'])
export class RentalReviewEntity extends BaseEntity {
  /**
   * 租赁订单 ID（唯一，一单一评）
   */
  @Expose()
  @Column({ type: 'uuid', comment: '租赁订单 ID' })
  orderId: string;

  /**
   * 资产 ID
   */
  @Expose()
  @Column({ type: 'uuid', comment: '资产 ID', nullable: true })
  assetId: string;

  /**
   * 承租方 ID
   */
  @Expose()
  @Column({ type: 'uuid', comment: '承租方 ID', nullable: true })
  lesseeId: string;

  /**
   * 出租方 ID
   */
  @Expose()
  @Column({ type: 'uuid', comment: '出租方 ID', nullable: true })
  lessorId: string;

  /**
   * 评分 1-5
   */
  @Expose()
  @Column({ type: 'tinyint', comment: '评分 1-5', unsigned: true })
  score: number;

  /**
   * 评论内容
   */
  @Expose()
  @Column({ type: 'text', nullable: true, comment: '评论内容' })
  content: string;

  /**
   * 图片 URL 数组
   */
  @Expose()
  @Column({ type: 'json', nullable: true, comment: '图片 URL 数组' })
  images: string[];

  /**
   * 评价状态
   */
  @Expose()
  @Column({ type: 'varchar', length: 20, default: RentalReviewStatus.PENDING, comment: '评价状态' })
  status: RentalReviewStatus;

  /**
   * 出租方回复内容
   */
  @Expose()
  @Column({ type: 'text', nullable: true, comment: '出租方回复内容' })
  replyContent: string;

  /**
   * 回复时间
   */
  @Expose()
  @Column({ type: 'timestamp', nullable: true, comment: '回复时间' })
  replyAt: Date;

  /**
   * 拒绝原因（审核拒绝时）
   */
  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true, comment: '拒绝原因' })
  rejectReason: string;

  /**
   * 审核通过时间
   */
  @Expose()
  @Column({ type: 'timestamp', nullable: true, comment: '审核通过时间' })
  approvedAt: Date;

  /**
   * 审核人 ID（后台）
   */
  @Expose()
  @Column({ type: 'uuid', nullable: true, comment: '审核人 ID' })
  approvedById: string;

  /** ========== 关系 ========== */

  @ManyToOne(() => RentalOrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: RentalOrderEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessee_id' })
  lessee: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessor_id' })
  lessor: UserEntity;
}
