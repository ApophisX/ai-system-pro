import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为用户表新增企业认证状态字段
 *
 * 企业认证需后台人工审核，与个人实名认证（verificationStatus）区分
 */
export class AddEnterpriseVerificationStatusToUser1739310000000 implements MigrationInterface {
  name = 'AddEnterpriseVerificationStatusToUser1739310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user\`
      ADD COLUMN \`enterprise_verification_status\` varchar(20) NULL COMMENT '企业认证状态：pending/verified/rejected，需后台审核' AFTER \`verification_status\`,
      ADD COLUMN \`enterprise_verified_at\` timestamp NULL COMMENT '企业认证通过时间' AFTER \`enterprise_verification_status\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user\`
      DROP COLUMN \`enterprise_verification_status\`,
      DROP COLUMN \`enterprise_verified_at\`
    `);
  }
}
