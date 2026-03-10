import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为已有 withdraw_orders 表补充提现方式、开户行字段
 * 若表由新版 CreateWithdrawTables 创建（已含这些列），则跳过
 */
export class AddWithdrawChannelToWithdrawOrders1739260000000 implements MigrationInterface {
  name = 'AddWithdrawChannelToWithdrawOrders1739260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('withdraw_orders');
    if (!table) return;

    const hasChannel = table.columns.some(c => c.name === 'withdraw_channel');
    if (!hasChannel) {
      await queryRunner.query(`
        ALTER TABLE \`withdraw_orders\`
        ADD COLUMN \`withdraw_channel\` varchar(20) NOT NULL DEFAULT 'wechat' COMMENT '提现方式' AFTER \`actual_amount\`
      `);
    }

    const hasBankBranch = table.columns.some(c => c.name === 'bank_branch_address');
    if (!hasBankBranch) {
      await queryRunner.query(`
        ALTER TABLE \`withdraw_orders\`
        ADD COLUMN \`bank_branch_address\` varchar(200) NULL COMMENT '开户行地址' AFTER \`target_account\`
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('withdraw_orders');
    if (!table) return;

    const hasChannel = table.columns.some(c => c.name === 'withdraw_channel');
    const hasBankBranch = table.columns.some(c => c.name === 'bank_branch_address');

    if (hasChannel || hasBankBranch) {
      const drops: string[] = [];
      if (hasChannel) drops.push('DROP COLUMN `withdraw_channel`');
      if (hasBankBranch) drops.push('DROP COLUMN `bank_branch_address`');
      await queryRunner.query(`ALTER TABLE \`withdraw_orders\` ${drops.join(', ')}`);
    }
  }
}
