import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 创建租赁评价表及资产评价统计字段
 * - rental_review: 租赁评价表
 * - asset: 新增 review_count, score1_count ~ score5_count
 */
export class CreateRentalReviewTable1739290000000 implements MigrationInterface {
  name = 'CreateRentalReviewTable1739290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // rental_review 表
    await queryRunner.query(`
      CREATE TABLE \`rental_review\` (
        \`id\` varchar(36) NOT NULL,
        \`order_id\` varchar(36) NOT NULL COMMENT '租赁订单 ID',
        \`asset_id\` varchar(36) NOT NULL COMMENT '资产 ID',
        \`lessee_id\` varchar(36) NOT NULL COMMENT '承租方 ID',
        \`lessor_id\` varchar(36) NOT NULL COMMENT '出租方 ID',
        \`score\` tinyint unsigned NOT NULL COMMENT '评分 1-5',
        \`content\` text NULL COMMENT '评论内容',
        \`images\` json NULL COMMENT '图片 URL 数组',
        \`status\` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '评价状态',
        \`reply_content\` text NULL COMMENT '出租方回复内容',
        \`reply_at\` timestamp NULL COMMENT '回复时间',
        \`reject_reason\` varchar(255) NULL COMMENT '拒绝原因',
        \`approved_at\` timestamp NULL COMMENT '审核通过时间',
        \`approved_by_id\` varchar(36) NULL COMMENT '审核人 ID',
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
        UNIQUE INDEX \`uk_order_review\` (\`order_id\`),
        INDEX \`IDX_rental_review_asset_status\` (\`asset_id\`, \`status\`),
        INDEX \`IDX_rental_review_lessee\` (\`lessee_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租赁评价表'
    `);

    // asset 表新增评价统计字段
    await queryRunner.query(`
      ALTER TABLE \`asset\`
        ADD COLUMN \`review_count\` int NOT NULL DEFAULT 0 COMMENT '已通过审核的评价数量',
        ADD COLUMN \`score1_count\` int NOT NULL DEFAULT 0 COMMENT '1 星评价数量',
        ADD COLUMN \`score2_count\` int NOT NULL DEFAULT 0 COMMENT '2 星评价数量',
        ADD COLUMN \`score3_count\` int NOT NULL DEFAULT 0 COMMENT '3 星评价数量',
        ADD COLUMN \`score4_count\` int NOT NULL DEFAULT 0 COMMENT '4 星评价数量',
        ADD COLUMN \`score5_count\` int NOT NULL DEFAULT 0 COMMENT '5 星评价数量'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`asset\`
        DROP COLUMN \`review_count\`,
        DROP COLUMN \`score1_count\`,
        DROP COLUMN \`score2_count\`,
        DROP COLUMN \`score3_count\`,
        DROP COLUMN \`score4_count\`,
        DROP COLUMN \`score5_count\`
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS \`rental_review\``);
  }
}
