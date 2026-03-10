import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWithdrawTables1739250000000 implements MigrationInterface {
  name = 'CreateWithdrawTables1739250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`merchant_accounts\` (
        \`id\` varchar(36) NOT NULL,
        \`merchant_id\` varchar(36) NOT NULL,
        \`total_balance\` decimal(15,2) NOT NULL DEFAULT 0,
        \`frozen_balance\` decimal(15,2) NOT NULL DEFAULT 0,
        \`available_balance\` decimal(15,2) NOT NULL DEFAULT 0,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`version\` int NOT NULL DEFAULT 1,
        \`updated_by\` varchar(50) NULL,
        \`update_by_id\` varchar(50) NULL,
        \`created_by\` varchar(50) NULL,
        \`created_by_id\` varchar(50) NULL,
        \`deleted_by\` varchar(50) NULL,
        \`deleted_by_id\` varchar(50) NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`remark\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_merchant_account_merchant_id\` (\`merchant_id\`),
        KEY \`IDX_deleted_at\` (\`deleted_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`account_flows\` (
        \`id\` varchar(36) NOT NULL,
        \`flow_no\` varchar(50) NOT NULL,
        \`merchant_id\` varchar(36) NOT NULL,
        \`amount\` decimal(15,2) NOT NULL,
        \`type\` varchar(50) NOT NULL,
        \`balance_type\` varchar(20) NOT NULL,
        \`balance_before\` decimal(15,2) NOT NULL,
        \`balance_after\` decimal(15,2) NOT NULL,
        \`related_type\` varchar(20) NOT NULL,
        \`related_id\` varchar(36) NOT NULL,
        \`idempotency_key\` varchar(64) NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`version\` int NOT NULL DEFAULT 1,
        \`updated_by\` varchar(50) NULL,
        \`update_by_id\` varchar(50) NULL,
        \`created_by\` varchar(50) NULL,
        \`created_by_id\` varchar(50) NULL,
        \`deleted_by\` varchar(50) NULL,
        \`deleted_by_id\` varchar(50) NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`remark\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_account_flow_idempotency\` (\`idempotency_key\`),
        UNIQUE KEY \`UQ_flow_no\` (\`flow_no\`),
        KEY \`IDX_account_flow_merchant_created\` (\`merchant_id\`,\`created_at\`),
        KEY \`IDX_deleted_at\` (\`deleted_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`withdraw_orders\` (
        \`id\` varchar(36) NOT NULL,
        \`withdraw_no\` varchar(50) NOT NULL,
        \`merchant_id\` varchar(36) NOT NULL,
        \`amount\` decimal(15,2) NOT NULL,
        \`fee\` decimal(15,2) NOT NULL DEFAULT 0,
        \`actual_amount\` decimal(15,2) NOT NULL,
        \`withdraw_channel\` varchar(20) NOT NULL DEFAULT 'wechat' COMMENT '提现方式',
        \`target_account\` varchar(128) NOT NULL,
        \`bank_branch_address\` varchar(200) NULL COMMENT '开户行地址',
        \`idempotency_key\` varchar(64) NOT NULL,
        \`requested_at\` timestamp NOT NULL,
        \`reviewed_at\` timestamp NULL,
        \`processed_at\` timestamp NULL,
        \`completed_at\` timestamp NULL,
        \`failed_reason\` text NULL,
        \`reject_reason\` text NULL,
        \`third_party_withdraw_no\` varchar(100) NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`version\` int NOT NULL DEFAULT 1,
        \`updated_by\` varchar(50) NULL,
        \`update_by_id\` varchar(50) NULL,
        \`created_by\` varchar(50) NULL,
        \`created_by_id\` varchar(50) NULL,
        \`deleted_by\` varchar(50) NULL,
        \`deleted_by_id\` varchar(50) NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`remark\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_withdraw_order_withdraw_no\` (\`withdraw_no\`),
        UNIQUE KEY \`IDX_withdraw_order_idempotency\` (\`idempotency_key\`),
        KEY \`IDX_withdraw_order_merchant_status\` (\`merchant_id\`,\`status\`),
        KEY \`IDX_deleted_at\` (\`deleted_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `withdraw_orders`');
    await queryRunner.query('DROP TABLE IF EXISTS `account_flows`');
    await queryRunner.query('DROP TABLE IF EXISTS `merchant_accounts`');
  }
}
