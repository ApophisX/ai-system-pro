import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 创建资产规格信息举报表
 */
export class CreateReportSpecificationTable1739360000000 implements MigrationInterface {
  name = 'CreateReportSpecificationTable1739360000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`report_specification\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
        \`reporter_id\` varchar(36) NOT NULL COMMENT '举报人 ID',
        \`asset_id\` varchar(36) NOT NULL COMMENT '被举报资产 ID',
        \`reason\` varchar(50) NOT NULL COMMENT '举报原因',
        \`description\` text NOT NULL COMMENT '举报说明',
        \`images\` json NULL COMMENT '图片 URL 数组',
        \`status\` tinyint NOT NULL DEFAULT 0 COMMENT '举报状态：0-待处理 1-成立 2-驳回 3-自动关闭',
        \`handle_result\` varchar(50) NULL COMMENT '处理结果',
        \`handler_id\` varchar(36) NULL COMMENT '审核人 ID',
        \`handled_at\` timestamp NULL COMMENT '处理时间',
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
        INDEX \`IDX_report_specification_reporter\` (\`reporter_id\`),
        INDEX \`IDX_report_specification_asset\` (\`asset_id\`),
        INDEX \`IDX_report_specification_status\` (\`status\`),
        INDEX \`IDX_report_specification_created\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产规格信息举报表'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`report_specification\``);
  }
}
