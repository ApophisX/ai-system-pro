import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 asset_community 添加复合索引，优化公开资产列表排除社区资产的 NOT EXISTS 子查询
 *
 * 子查询: WHERE ac.asset_id = asset.id AND ac.deleted_at IS NULL
 * 复合索引 (asset_id, deleted_at) 可让 MySQL 在一次索引查找中同时满足两个条件
 */
export class AddAssetCommunityIndexForExcludeQuery1739400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX \`IDX_asset_community_asset_deleted\` ON \`asset_community\` (\`asset_id\`, \`deleted_at\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_asset_community_asset_deleted\` ON \`asset_community\``);
  }
}
