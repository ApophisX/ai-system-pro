import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 user 表添加 alipay_open_id 字段（支付宝提现打款使用）
 */
export class AddAlipayUserIdToUser1739270000000 implements MigrationInterface {
  name = 'AddAlipayUserIdToUser1739270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user');
    if (!table) return;

    const hasAlipayUserId = table.columns.some(c => c.name === 'alipay_open_id');
    if (!hasAlipayUserId) {
      await queryRunner.query(`
        ALTER TABLE \`user\`
        ADD COLUMN \`alipay_open_id\` varchar(100) NULL COMMENT '支付宝 open_id（用于提现打款）' AFTER \`wechat_unionid\`
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user');
    if (!table) return;

    const hasAlipayUserId = table.columns.some(c => c.name === 'alipay_open_id');
    if (hasAlipayUserId) {
      await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`alipay_open_id\``);
    }
  }
}
