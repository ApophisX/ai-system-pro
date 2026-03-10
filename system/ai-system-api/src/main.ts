import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { initializeObservability, initializeSecurity, initializeApp } from './bootstrap';
import { IS_DEV } from './common/constants/global';

async function bootstrap() {
  // 创建 NestJS 应用实例
  const app = await NestFactory.create(AppModule);

  // 初始化顺序很重要：
  // 1. 可观测性（最早，确保有日志输出）
  initializeObservability(app);

  // 2. 安全策略
  initializeSecurity(app);

  // 3. 应用配置（最后）
  initializeApp(app);

  // 启动应用 - 直接从环境变量读取，避免 ConfigService 未初始化的问题
  const port = parseInt(process.env.SERVER_PORT || process.env.PORT || '3000', 10);
  let host = process.env.SERVER_HOST || '0.0.0.0';
  if (IS_DEV) {
    // 获取本地ip
    host = 'localhost';
  }

  await app.listen(port);
}

void bootstrap();
