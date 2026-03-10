/**
 * 应用初始化
 *
 * 初始化应用级别的全局配置，包括中间件、管道、CORS、Swagger 等
 */

import { IS_DEV } from '@/common/constants/global';
import { RequestIdMiddleware } from '@/common/middlewares/request-id.middleware';
import {
  APP_CONFIG_KEY,
  AppConfig,
  REDIS_CONFIG_KEY,
  RedisConfig,
  SERVER_CONFIG_KEY,
  ServerConfig,
  redisConfig,
} from '@/config';
import { BadRequestException, INestApplication, ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import Redis from 'ioredis'; // ← 改成 ioredis
import * as create from 'connect-redis';
import { createRedisClient } from '@/infrastructure/redis/redis.factory';

const logger = new Logger('Bootstrap');

/**
 * 初始化应用配置
 *
 * @param app NestJS 应用实例
 */
export function initializeApp(app: INestApplication): void {
  const environment = process.env.NODE_ENV || 'development';

  const configService = app.get(ConfigService);

  // 1. 获取应用配置
  const appConfig = configService.get<AppConfig>(APP_CONFIG_KEY)!;
  const serverConfig = configService.get<ServerConfig>(SERVER_CONFIG_KEY)!;
  const redisConfig = configService.get<RedisConfig>(REDIS_CONFIG_KEY)!;

  // 2. 设置全局前缀和 API 版本控制
  const globalPrefix = serverConfig.globalPrefix;
  const apiPrefix = serverConfig.apiPrefix;
  const apiVersion = serverConfig.apiVersion;
  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  // 启用 API 版本控制（URI 方式）
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
    prefix: 'v',
  });

  // 3. 设置验证管道（全局）
  app.useGlobalPipes(
    new ValidationPipe({
      // 自动转换 payload 到 DTO 类实例
      transform: true,
      // 去掉 DTO 中不存在的属性
      whitelist: true,
      // 当检测到 DTO 中不存在的属性时，抛出异常
      forbidNonWhitelisted: false,
      // 转换简单类型（string -> number）
      transformOptions: {
        enableImplicitConversion: true,
      },
      // 自定义异常工厂
      exceptionFactory: errors => {
        const messages = errors
          .map(error => {
            const constraints = Object.values(error.constraints || {});
            return `${error.property}: ${constraints.join(', ')}`;
          })
          .join('; ');
        return new BadRequestException(`验证失败: ${messages}`);
      },
    }),
  );

  app.use(RequestIdMiddleware);
  app.use(cookieParser());

  if (IS_DEV) {
    app.use(
      session({
        store: new create.RedisStore({
          client: createRedisClient(redisConfig),
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 1000,
        },
      }),
    );
  }

  // 4. CORS 配置
  app.enableCors({
    origin: IS_DEV ? true : serverConfig.corsOrigins,
    credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 5. 设置 JSON 和 URL-encoded 中间件
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const baseUrl = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}`;

  // 6. Swagger 文档配置（非生产环境）
  if (IS_DEV) {
    const config = new DocumentBuilder()
      .setTitle(appConfig.name)
      .setDescription('API Documentation')
      .setVersion(appConfig.version)
      .setExternalDoc(`swagger-json`, `${apiPrefix}/docs-json`)
      // .addTag('AppAddress')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addServer(`${baseUrl}${apiPrefix}/docs`, environment)
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      // operationIdFactory: (controllerKey, methodKey, version) => methodKey,
      // autoTagControllers: true,
    });
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // 7. Keep-Alive 配置
  const server = app.getHttpServer();
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  // 8. 错误处理中间件（兜底，全局异常过滤器会优先处理）
  app.use((err: unknown, req: unknown, res: express.Response, next: express.NextFunction) => {
    if (err) {
      const status = (err as { status?: number }).status || 500;
      const message = (err as { message?: string }).message || '内部服务器错误';
      const request = req as express.Request;

      res.status(status).json({
        code: status,
        message,
        error: {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      });
    } else {
      next();
    }
  });

  setTimeout(() => {
    // 记录初始化完成日志
    logger.log(`
-------------------------------------
⚙️  应用配置初始化完成
📦 应用名称: ${appConfig.name} v${appConfig.version}
🌍 运行环境: ${environment}
🔧 服务地址: ${baseUrl}
📂 全局前缀: ${globalPrefix || '无'}
🔗 API 前缀: ${apiPrefix}
🔒 CORS  源: ${serverConfig.corsOrigins.join(', ')}
${IS_DEV ? `📚 Swagger: ${baseUrl}${apiPrefix}/docs` : ''}
-------------------------------------\n`);
  }, 500);
}
