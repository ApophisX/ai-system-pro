import { INestApplication } from '@nestjs/common';
import { Logger } from '@nestjs/common';

export async function initDatabaseData(app: INestApplication): Promise<void> {
  const logger = new Logger('InitData');

  try {
    logger.log('初始化数据库基础数据...');
    // const initService = app.get(AssetCategoryInitService);
    // await initService.init(false); // false 表示不强制，如果已有数据则跳过
  } catch (error) {
    logger.error('初始化数据库基础数据失败', error);
    // 不阻止应用启动，只记录错误
  }
}
