import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 rental_order 表新增 overdue_use_discount_remark 字段
 *
 * - overdue_use_discount_remark: 超期使用优惠备注（出租方设置优惠时的说明）
 */
export class AddOverdueUseDiscountRemarkToRentalOrder1739370000000 implements MigrationInterface {
  name = 'AddOverdueUseDiscountRemarkToRentalOrder1739370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`rental_order\`
      ADD COLUMN \`overdue_use_discount_remark\` varchar(200) NULL COMMENT '超期使用优惠备注' AFTER \`overdue_use_discount_amount\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`rental_order\`
      DROP COLUMN \`overdue_use_discount_remark\`
    `);
  }
}
