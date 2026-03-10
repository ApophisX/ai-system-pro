import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 rental_order 表新增 renewal_count 字段
 *
 * - renewal_count: 续租次数，0 表示原订单未续租过
 */
export class AddRenewalCountToRentalOrder1739340000000 implements MigrationInterface {
  name = 'AddRenewalCountToRentalOrder1739340000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`rental_order\`
      ADD COLUMN \`renewal_count\` int NOT NULL DEFAULT 0 COMMENT '续租次数' AFTER \`duration\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`rental_order\`
      DROP COLUMN \`renewal_count\`
    `);
  }
}
