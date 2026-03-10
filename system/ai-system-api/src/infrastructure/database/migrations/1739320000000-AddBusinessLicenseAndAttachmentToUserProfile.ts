import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 user_profile 表新增企业认证相关字段：
 * - business_license_photo_urls：营业执照照片地址（必填）
 * - attachment_urls：附件材料地址（可选）
 */
export class AddBusinessLicenseAndAttachmentToUserProfile1739320000000 implements MigrationInterface {
  name = 'AddBusinessLicenseAndAttachmentToUserProfile1739320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user_profile\`
      ADD COLUMN \`business_license_photo_urls\` text NULL COMMENT '营业执照照片地址（simple-array）' AFTER \`company_email\`,
      ADD COLUMN \`attachment_urls\` text NULL COMMENT '附件材料地址（simple-array，可选）' AFTER \`business_license_photo_urls\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user_profile\`
      DROP COLUMN \`business_license_photo_urls\`,
      DROP COLUMN \`attachment_urls\`
    `);
  }
}
