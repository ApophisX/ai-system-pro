/**
 * ORM 模块
 *
 * 数据库 ORM（TypeORM）全局连接配置
 * 负责注册 TypeORM 数据库连接，供所有业务模块使用
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DATABASE_CONFIG_KEY, DatabaseConfig } from '@/config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = configService.get<DatabaseConfig>(DATABASE_CONFIG_KEY);
        if (!dbConfig) {
          throw new Error('Database config not found');
        }

        return {
          type: 'mysql',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          retryAttempts: 2,
          // 实体自动加载（从所有模块中扫描）
          entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
          // 迁移文件路径
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          // 是否自动同步数据库结构（生产环境应设为 false）
          synchronize: dbConfig.synchronize || false,
          // 是否启用日志
          logging: dbConfig.logging || false,
          // 连接池配置
          extra: {
            // max: dbConfig.maxConnections || 20,
            connectionLimit: dbConfig.maxConnections || 20,
          },
          // 命名策略：使用下划线命名（snake_case）
          namingStrategy: new SnakeNamingStrategy(),
          // 时区
          timezone: '+08:00',
          // 字符集
          charset: 'utf8mb4',
          // 自动重连
          autoLoadEntities: true,
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class OrmModule {}
