import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 rental_order 表新增 inventory_code、inventory_snapshot 字段
 *
 * - inventory_code: 用户下单时传入的预绑定资产实例编号，支付完成后自动按此编号绑定资产实例
 * - inventory_snapshot: 订单完结时保存的资产实例快照（JSON），便于后续查询
 */
export class AddInventoryCodeToRentalOrder1739330000000 implements MigrationInterface {
  name = 'AddInventoryCodeToRentalOrder1739330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`rental_order\`
      ADD COLUMN \`inventory_code\` varchar(50) NULL COMMENT '预绑定的资产实例编号，支付完成后自动绑定' AFTER \`inventory_id\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`rental_order\`
      ADD COLUMN \`inventory_snapshot\` json NULL COMMENT '资产实例快照（订单完结时保存，含实例编号、名称、封面图、状态、状态标签、实例属性等）' AFTER \`inventory_code\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`rental_order\`
      DROP COLUMN \`inventory_snapshot\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`rental_order\`
      DROP COLUMN \`inventory_code\`
    `);
  }
}
