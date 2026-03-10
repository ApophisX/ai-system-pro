/**
 * 资产分类数据初始化脚本
 *
 * 使用方法：
 *   ts-node -r tsconfig-paths/register scripts/init-asset-categories.ts
 *   或者
 *   npm run init:categories
 *
 * 参数：
 *   --force, -f: 强制重新初始化（会重新初始化所有数据）
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/modules/app/app.module';
import { AssetCategoryInitService } from '../src/modules/asset/services/asset-category-init.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('InitAssetCategories');

  try {
    // 创建 NestJS 应用上下文
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // 获取初始化服务
    const initService = app.get(AssetCategoryInitService);

    // 检查命令行参数
    const args = process.argv.slice(2);
    const force = args.includes('--force') || args.includes('-f');

    // 检查状态
    logger.log('检查初始化状态...');
    const status = await initService.checkStatus();
    logger.log(`当前状态: ${status.hasData ? '已有数据' : '无数据'}`);
    logger.log(`根分类数量: ${status.rootCount}`);
    logger.log(`总分类数量: ${status.totalCount}`);

    // 执行初始化
    await initService.init(force);

    // 再次检查状态
    const finalStatus = await initService.checkStatus();
    logger.log('初始化后状态:');
    logger.log(`根分类数量: ${finalStatus.rootCount}`);
    logger.log(`总分类数量: ${finalStatus.totalCount}`);

    await app.close();
    logger.log('脚本执行完成');
    process.exit(0);
  } catch (error) {
    logger.error('脚本执行失败', error);
    process.exit(1);
  }
}

void bootstrap();
