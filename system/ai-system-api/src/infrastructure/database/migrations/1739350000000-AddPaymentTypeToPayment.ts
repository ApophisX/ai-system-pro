import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 payment 表新增 payment_type 字段
 *
 * 用于在账单主表直接区分租金账单、续租账单等类型，避免仅依赖 payment_records 判断类型
 */
export class AddPaymentTypeToPayment1739350000000 implements MigrationInterface {
  name = 'AddPaymentTypeToPayment1739350000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`payment\`
      ADD COLUMN \`payment_type\` varchar(50) NOT NULL DEFAULT 'rental' COMMENT '支付类型：order/installment/deposit/rental/service_fee/penalty/overdue_fee/renewal' AFTER \`failure_reason\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`payment\`
      DROP COLUMN \`payment_type\`
    `);
  }
}
