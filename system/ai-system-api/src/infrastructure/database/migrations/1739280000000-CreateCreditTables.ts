import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 创建信用体系相关表
 * - credit_event: 信用事件（不可变）
 * - credit_account: 信用账户
 * - credit_score_history: 评分历史
 */
export class CreateCreditTables1739280000000 implements MigrationInterface {
  name = 'CreateCreditTables1739280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // credit_event
    await queryRunner.query(`
      CREATE TABLE \`credit_event\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL COMMENT '用户 ID',
        \`actor_role\` varchar(20) NOT NULL COMMENT '行为主体角色：lessor 出租方 / lessee 承租方',
        \`related_order_id\` varchar(36) NULL COMMENT '关联订单 ID',
        \`event_type\` varchar(50) NOT NULL COMMENT '事件类型',
        \`impact_score\` int NOT NULL DEFAULT 0 COMMENT '影响分',
        \`risk_weight\` decimal(5,4) NOT NULL DEFAULT 1.0000 COMMENT '风险权重',
        \`model_version\` varchar(20) NOT NULL DEFAULT 'v1' COMMENT '模型版本',
        \`operator_type\` varchar(20) NOT NULL DEFAULT 'system' COMMENT '操作类型',
        \`metadata\` json NULL COMMENT '扩展元数据',
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
        INDEX \`IDX_credit_event_user_role\` (\`user_id\`, \`actor_role\`),
        INDEX \`IDX_credit_event_order\` (\`related_order_id\`),
        INDEX \`IDX_credit_event_created\` (\`created_at\`),
        INDEX \`IDX_credit_event_user_type\` (\`user_id\`, \`event_type\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='信用事件表'
    `);

    // credit_account
    await queryRunner.query(`
      CREATE TABLE \`credit_account\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL COMMENT '用户 ID',
        \`actor_role\` varchar(20) NOT NULL DEFAULT 'lessee' COMMENT '角色：lessor 出租方 / lessee 承租方',
        \`credit_score\` int NOT NULL DEFAULT 600 COMMENT '综合信用分',
        \`behavior_score\` int NOT NULL DEFAULT 600 COMMENT '行为分',
        \`risk_score\` int NOT NULL DEFAULT 600 COMMENT '风险分',
        \`stability_score\` int NOT NULL DEFAULT 600 COMMENT '资产稳定分',
        \`credit_level\` varchar(10) NOT NULL DEFAULT 'C' COMMENT '信用等级',
        \`credit_status\` varchar(20) NOT NULL DEFAULT 'normal' COMMENT '信用状态',
        \`model_version\` varchar(20) NOT NULL DEFAULT 'v1' COMMENT '模型版本',
        \`last_calculated_at\` timestamp NULL COMMENT '最后计算时间',
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
        UNIQUE INDEX \`UQ_credit_account_user_role\` (\`user_id\`, \`actor_role\`),
        INDEX \`IDX_credit_account_user\` (\`user_id\`),
        INDEX \`IDX_credit_account_level\` (\`credit_level\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='信用账户表'
    `);

    // credit_score_history
    await queryRunner.query(`
      CREATE TABLE \`credit_score_history\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL COMMENT '用户 ID',
        \`actor_role\` varchar(20) NOT NULL DEFAULT 'lessee' COMMENT '角色',
        \`credit_score\` int NOT NULL COMMENT '综合信用分',
        \`behavior_score\` int NOT NULL COMMENT '行为分',
        \`risk_score\` int NOT NULL COMMENT '风险分',
        \`stability_score\` int NOT NULL COMMENT '资产稳定分',
        \`credit_level\` varchar(10) NOT NULL COMMENT '信用等级',
        \`model_version\` varchar(20) NOT NULL COMMENT '模型版本',
        \`calculated_at\` timestamp NOT NULL COMMENT '计算时间',
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
        INDEX \`IDX_credit_score_history_user\` (\`user_id\`),
        INDEX \`IDX_credit_score_history_calculated\` (\`calculated_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='信用评分历史表'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`credit_score_history\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`credit_account\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`credit_event\``);
  }
}
