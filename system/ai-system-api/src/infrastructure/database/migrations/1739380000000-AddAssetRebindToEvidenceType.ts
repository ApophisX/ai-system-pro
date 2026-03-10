import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 rental_order_evidence.evidence_type 枚举添加 asset_rebind 值
 *
 * 用于支持换绑资产实例时的留痕凭证
 */
export class AddAssetRebindToEvidenceType1739380000000 implements MigrationInterface {
  name = 'AddAssetRebindToEvidenceType1739380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`rental_order_evidence\`
      MODIFY COLUMN \`evidence_type\` enum(
        'asset_delivery',
        'asset_rebind',
        'asset_receipt_confirm',
        'asset_usage',
        'asset_return',
        'asset_return_confirm',
        'asset_return_reject',
        'asset_inspection',
        'asset_damage',
        'asset_repair',
        'asset_loss',
        'deposit_deduction',
        'deposit_deduction_reject',
        'deposit_deduction_approve',
        'deposit_refund',
        'order_cancel',
        'order_cancel_reject',
        'order_cancel_approve',
        'order_refund',
        'order_complete',
        'dispute',
        'platform_decision',
        'other'
      ) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚时移除 asset_rebind，需先确保无该类型记录
    await queryRunner.query(`
      ALTER TABLE \`rental_order_evidence\`
      MODIFY COLUMN \`evidence_type\` enum(
        'asset_delivery',
        'asset_receipt_confirm',
        'asset_usage',
        'asset_return',
        'asset_return_confirm',
        'asset_return_reject',
        'asset_inspection',
        'asset_damage',
        'asset_repair',
        'asset_loss',
        'deposit_deduction',
        'deposit_deduction_reject',
        'deposit_deduction_approve',
        'deposit_refund',
        'order_cancel',
        'order_cancel_reject',
        'order_cancel_approve',
        'order_refund',
        'order_complete',
        'dispute',
        'platform_decision',
        'other'
      ) NULL
    `);
  }
}
