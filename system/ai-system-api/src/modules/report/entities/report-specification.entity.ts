import { Entity, Index, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntityWithNumericId } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { AssetEntity } from '@/modules/asset/entities';
import { ReportStatus } from '../enums';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';

/**
 * 资产规格信息举报实体
 *
 * 用户对资产（价格、图片、描述、联系方式等）的举报记录
 */
@Entity('report_specification')
@Index('IDX_report_specification_reporter', ['reporterId'])
@Index('IDX_report_specification_asset', ['assetId'])
@Index('IDX_report_specification_status', ['status'])
@Index('IDX_report_specification_created', ['createdAt'])
export class ReportSpecificationEntity extends BaseEntityWithNumericId {
  /**
   * 举报人 ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', comment: '举报人 ID', nullable: true })
  reporterId: string;

  /**
   * 被举报资产 ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', comment: '被举报资产 ID', nullable: true })
  assetId: string;

  /**
   * 举报原因
   */
  @Expose()
  @ColumnWithApi({ type: 'varchar', length: 50, comment: '举报原因', nullable: true })
  reason: string;

  /**
   * 举报说明
   */
  @Expose()
  @ColumnWithApi({ type: 'text', comment: '举报说明', nullable: true })
  description: string;

  /**
   * 图片 URL 数组
   */
  @Expose()
  @ColumnWithApi({ type: 'json', nullable: true, comment: '图片 URL 数组' })
  images: string[];

  /**
   * 举报状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'tinyint',
    default: ReportStatus.PENDING,
    comment: '举报状态',
    apiOptions: {
      enum: ReportStatus,
      description: '举报状态, 0: 待处理, 1: 举报成立, 2: 举报驳回, 3: 自动关闭',
    },
  })
  status: ReportStatus;

  /**
   * 处理结果（approve/reject/mark_malicious）
   */
  @Expose()
  @ColumnWithApi({ type: 'varchar', length: 50, nullable: true, comment: '处理结果' })
  handleResult: string;

  /**
   * 审核人 ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', nullable: true, comment: '审核人 ID' })
  handlerId: string;

  /**
   * 处理时间
   */
  @Expose()
  @ColumnWithApi({ type: 'timestamp', nullable: true, comment: '处理时间' })
  handledAt: Date;

  /** ========== 关系 ========== */

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: UserEntity;

  @ManyToOne(() => AssetEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: AssetEntity;
}
