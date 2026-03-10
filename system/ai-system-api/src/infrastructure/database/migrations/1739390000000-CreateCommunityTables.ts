import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 创建社区相关表
 * - community: 社区
 * - community_member: 社区成员
 * - asset_community: 资产-社区关联
 */
export class CreateCommunityTables1739390000000 implements MigrationInterface {
  name = 'CreateCommunityTables1739390000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`community\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(100) NOT NULL COMMENT '社区名称',
        \`description\` text NULL COMMENT '社区描述',
        \`cover_image\` varchar(500) NULL COMMENT '封面图 URL',
        \`type\` enum('public','private') NOT NULL DEFAULT 'public' COMMENT '社区类型',
        \`status\` enum('pending','approved','rejected','closed') NOT NULL DEFAULT 'pending' COMMENT '社区状态',
        \`invite_code\` varchar(20) NULL UNIQUE COMMENT '邀请码',
        \`creator_id\` varchar(36) NOT NULL COMMENT '创建者用户 ID',
        \`audit_by_id\` varchar(36) NULL COMMENT '审核人 ID',
        \`audit_at\` timestamp NULL COMMENT '审核时间',
        \`audit_remark\` varchar(500) NULL COMMENT '审核意见',
        \`member_count\` int NOT NULL DEFAULT 0 COMMENT '成员数量',
        \`asset_count\` int NOT NULL DEFAULT 0 COMMENT '绑定资产数量',
        \`sort_order\` int NOT NULL DEFAULT 0 COMMENT '排序权重',
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
        INDEX \`IDX_community_status_type\` (\`status\`, \`type\`),
        INDEX \`IDX_community_creator\` (\`creator_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区表'
    `);

    await queryRunner.query(`
      CREATE TABLE \`community_member\` (
        \`id\` varchar(36) NOT NULL,
        \`community_id\` varchar(36) NOT NULL COMMENT '社区 ID',
        \`user_id\` varchar(36) NOT NULL COMMENT '用户 ID',
        \`role\` enum('creator','admin','member') NOT NULL DEFAULT 'member' COMMENT '成员角色',
        \`joined_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
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
        UNIQUE KEY \`uk_community_user\` (\`community_id\`, \`user_id\`),
        INDEX \`IDX_community_member_user\` (\`user_id\`),
        INDEX \`IDX_community_member_community\` (\`community_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区成员表'
    `);

    await queryRunner.query(`
      CREATE TABLE \`asset_community\` (
        \`id\` varchar(36) NOT NULL,
        \`asset_id\` varchar(36) NOT NULL COMMENT '资产 ID',
        \`community_id\` varchar(36) NOT NULL COMMENT '社区 ID',
        \`sort_order\` int NOT NULL DEFAULT 0 COMMENT '排序权重',
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
        UNIQUE KEY \`uk_asset_community\` (\`asset_id\`, \`community_id\`),
        INDEX \`IDX_asset_community_asset\` (\`asset_id\`),
        INDEX \`IDX_asset_community_community\` (\`community_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产-社区关联表'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`asset_community\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`community_member\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`community\``);
  }
}
