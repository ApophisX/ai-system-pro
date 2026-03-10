import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 创建商户邀请裂变表
 * - merchant_invite_code: 邀请码
 * - merchant_invite_relation: 邀请关系
 * - merchant_invite_reward: 奖励记录
 */
export class CreateMerchantInviteTables1739300000000 implements MigrationInterface {
  name = 'CreateMerchantInviteTables1739300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`merchant_invite_code\` (
        \`id\` varchar(36) NOT NULL,
        \`employee_id\` varchar(36) NOT NULL COMMENT '归属员工 ID',
        \`code\` varchar(32) NOT NULL COMMENT '邀请码（唯一）',
        \`expire_at\` timestamp NULL COMMENT '过期时间（空则永不过期）',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        \`deleted_at\` timestamp NULL COMMENT '删除时间',
        \`version\` int NOT NULL DEFAULT 1 COMMENT '乐观锁版本号',
        \`updated_by\` varchar(50) NULL COMMENT '更新者',
        \`update_by_id\` varchar(50) NULL COMMENT '更新者 ID',
        \`created_by\` varchar(50) NULL COMMENT '创建者',
        \`created_by_id\` varchar(50) NULL COMMENT '创建者 ID',
        \`deleted_by\` varchar(50) NULL COMMENT '删除者',
        \`deleted_by_id\` varchar(50) NULL COMMENT '删除者 ID',
        \`is_active\` tinyint NOT NULL DEFAULT 1 COMMENT '是否有效',
        \`remark\` text NULL COMMENT '备注',
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`uk_merchant_invite_code\` (\`code\`),
        INDEX \`IDX_merchant_invite_code_employee\` (\`employee_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户邀请码'
    `);

    await queryRunner.query(`
      CREATE TABLE \`merchant_invite_relation\` (
        \`id\` varchar(36) NOT NULL,
        \`employee_id\` varchar(36) NOT NULL COMMENT '邀请员工 ID',
        \`merchant_id\` varchar(36) NOT NULL COMMENT '商户 ID（= userId）',
        \`invite_code\` varchar(32) NOT NULL COMMENT '使用的邀请码',
        \`status\` varchar(20) NOT NULL DEFAULT 'registered' COMMENT '关系状态',
        \`verified_at\` timestamp NULL COMMENT '认证通过时间',
        \`listed_at\` timestamp NULL COMMENT '上架达标时间',
        \`first_order_at\` timestamp NULL COMMENT '首单完成时间',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        \`deleted_at\` timestamp NULL COMMENT '删除时间',
        \`version\` int NOT NULL DEFAULT 1 COMMENT '乐观锁版本号',
        \`updated_by\` varchar(50) NULL COMMENT '更新者',
        \`update_by_id\` varchar(50) NULL COMMENT '更新者 ID',
        \`created_by\` varchar(50) NULL COMMENT '创建者',
        \`created_by_id\` varchar(50) NULL COMMENT '创建者 ID',
        \`deleted_by\` varchar(50) NULL COMMENT '删除者',
        \`deleted_by_id\` varchar(50) NULL COMMENT '删除者 ID',
        \`is_active\` tinyint NOT NULL DEFAULT 1 COMMENT '是否有效',
        \`remark\` text NULL COMMENT '备注',
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`uk_merchant_invite_relation_merchant\` (\`merchant_id\`),
        INDEX \`IDX_merchant_invite_relation_employee\` (\`employee_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户邀请关系'
    `);

    await queryRunner.query(`
      CREATE TABLE \`merchant_invite_reward\` (
        \`id\` varchar(36) NOT NULL,
        \`employee_id\` varchar(36) NOT NULL COMMENT '员工 ID',
        \`merchant_id\` varchar(36) NOT NULL COMMENT '商户 ID',
        \`type\` varchar(20) NOT NULL COMMENT '奖励类型',
        \`amount\` decimal(10,2) NOT NULL DEFAULT 0 COMMENT '奖励金额（元）',
        \`status\` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '奖励状态',
        \`related_order_id\` varchar(36) NULL COMMENT '关联订单 ID',
        \`released_at\` timestamp NULL COMMENT '实际发放时间',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        \`deleted_at\` timestamp NULL COMMENT '删除时间',
        \`version\` int NOT NULL DEFAULT 1 COMMENT '乐观锁版本号',
        \`updated_by\` varchar(50) NULL COMMENT '更新者',
        \`update_by_id\` varchar(50) NULL COMMENT '更新者 ID',
        \`created_by\` varchar(50) NULL COMMENT '创建者',
        \`created_by_id\` varchar(50) NULL COMMENT '创建者 ID',
        \`deleted_by\` varchar(50) NULL COMMENT '删除者',
        \`deleted_by_id\` varchar(50) NULL COMMENT '删除者 ID',
        \`is_active\` tinyint NOT NULL DEFAULT 1 COMMENT '是否有效',
        \`remark\` text NULL COMMENT '备注',
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_merchant_invite_reward_employee\` (\`employee_id\`),
        INDEX \`IDX_merchant_invite_reward_merchant\` (\`merchant_id\`),
        INDEX \`IDX_merchant_invite_reward_type_status\` (\`type\`, \`status\`),
        INDEX \`IDX_merchant_invite_reward_order\` (\`related_order_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户邀请奖励'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`merchant_invite_reward\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`merchant_invite_relation\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`merchant_invite_code\``);
  }
}
