/**
 * PM2 生产级配置
 *
 * 使用方式：
 *   pnpm build
 *   mkdir -p logs
 *   pm2 start ecosystem.config.js --env production
 *   pm2 start ecosystem.config.js --env staging
 *
 * 日志：Winston 写 logs/application-*.log、logs/error-*.log
 *      PM2 写 logs/pm2-out.log、logs/pm2-error.log
 */

const path = require('path');

module.exports = {
  apps: [
    {
      name: 'ai-system-api',
      script: path.join(__dirname, 'dist/main.js'),
      cwd: __dirname,
      interpreter: 'node',

      // 实例与模式
      instances: 1,
      exec_mode: 'fork',

      // 进程管理
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',

      // 优雅关闭（NestJS 默认支持 SIGTERM）
      kill_timeout: 10000,
      wait_ready: false,
      listen_timeout: 10000,

      // 生产环境变量
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      env_staging: {
        NODE_ENV: 'staging',
      },

      // PM2 日志（stdout/stderr 输出，与 Winston 日志并存）
      error_file: path.join(__dirname, 'logs/pm2-error.log'),
      out_file: path.join(__dirname, 'logs/pm2-out.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true,

      // 可选：显式指定 .env 路径（PM2 默认会加载 cwd 下的 .env）
      // env_file: path.join(__dirname, '.env'),
    },
  ],
};
