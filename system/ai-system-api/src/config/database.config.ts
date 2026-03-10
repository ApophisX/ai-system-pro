/**
 * 数据库配置
 *
 * 数据库连接相关配置
 */

import { registerAs } from '@nestjs/config';

export const DATABASE_CONFIG_KEY = 'database';
export const databaseConfig = registerAs(DATABASE_CONFIG_KEY, () => ({
  url: process.env.DATABASE_URL,
  provider: process.env.DATABASE_PROVIDER || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20', 10),
}));

export type DatabaseConfig = ReturnType<typeof databaseConfig>;
