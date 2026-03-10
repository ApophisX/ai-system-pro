# Bootstrap 模块

## 概述

Bootstrap 模块负责应用的启动阶段初始化，包括三个核心功能：

1. **应用初始化** (`init-app.ts`) - 配置应用的全局设置
2. **可观测性初始化** (`init-observability.ts`) - 配置日志和监控
3. **安全初始化** (`init-security.ts`) - 配置安全策略

## 初始化顺序

在 `main.ts` 中的初始化顺序很重要，应按以下顺序执行：

```typescript
// 1. 初始化可观测性（最早，确保有日志输出）
await initializeObservability(app);

// 2. 初始化安全策略
await initializeSecurity(app);

// 3. 初始化应用配置（最后）
await initializeApp(app);
```

## 详细说明

### 1. 应用初始化 (`init-app.ts`)

#### 功能

- **全局前缀设置** - 设置 API 路由前缀
- **中间件配置** - 启用 gzip 压缩
- **全局管道** - 数据验证和转换
  - 白名单验证：只允许 DTO 中定义的属性
  - 自动类型转换：将 JSON 自动转换为 DTO 实例
  - 自定义错误格式：统一的验证错误响应
- **CORS 配置** - 允许跨域请求
- **Swagger 文档** - 非生产环境自动生成 API 文档
- **Keep-Alive 配置** - 支持长连接

#### 配置示例

```typescript
// CORS 允许的源
corsOrigins: ['http://localhost:3000', 'https://example.com'];

// 验证管道会自动拒绝非法数据
// 例如：DTO 中未定义的字段将被移除
```

### 2. 可观测性初始化 (`init-observability.ts`)

#### 功能

- **Winston 日志系统** - 结构化日志输出
  - 开发环境：输出到控制台（带颜色）
  - 生产环境：输出到日志文件并轮转
- **日志分类**
  - `logs/application-YYYY-MM-DD.log` - 应用日志
  - `logs/error-YYYY-MM-DD.log` - 错误日志
  - `logs/exceptions-YYYY-MM-DD.log` - 未捕获异常
- **请求追踪 ID** - 每个请求都有唯一的 ID，便于链路追踪
- **性能监控准备** - 可集成 APM 工具（如 DataDog、New Relic）

#### 日志输出格式

```json
{
  "timestamp": "2024-01-01 12:00:00",
  "level": "info",
  "message": "Application initialized",
  "context": "Bootstrap",
  "environment": "development"
}
```

### 3. 安全初始化 (`init-security.ts`)

#### 功能

- **安全HTTP头** - 防止各种攻击
  - `X-Content-Type-Options: nosniff` - 防止MIME嗅探
  - `X-Frame-Options: DENY` - 防止点击劫持
  - `X-XSS-Protection: 1; mode=block` - XSS保护
  - `Strict-Transport-Security` - HTTPS强制
  - `Content-Security-Policy` - 内容安全策略
- **请求大小限制** - 防止大请求导致内存溢出
- **请求超时** - 防止慢速DoS攻击（默认30秒）
- **内容类型检查** - 验证请求的内容类型

#### 安全配置

```typescript
// 请求超时（毫秒）
requestTimeout: 30000; // 30 秒

// JSON body 限制
maxJsonBodySize: '10mb';

// URL-encoded body 限制
maxUrlEncodedBodySize: '10mb';
```

## 配置说明

### 环境变量

通过 `src/config/server.config.ts` 和 `src/config/app.config.ts` 配置：

```env
# 应用配置
NODE_ENV=development
DEBUG=true
APP_NAME=xunwu-client-api
APP_VERSION=1.0.0
TZ=Asia/Shanghai

# 服务器配置
SERVER_PORT=3000
SERVER_HOST=0.0.0.0
SERVER_PROTOCOL=http
API_PREFIX=/api
GLOBAL_PREFIX=/api
CORS_ORIGINS=http://localhost:3000,https://example.com
```

## 扩展建议

### 1. 集成 APM 工具

在 `initializeObservability` 中添加：

```typescript
if (environment === 'production') {
  const apm = require('elastic-apm-node');
  apm.start({ serviceName: 'xunwu-client-api' });
}
```

### 2. 集成分布式链路追踪

```typescript
// 集成 Jaeger 或 Zipkin
const tracer = initJaeger('xunwu-client-api');
app.use((req, res, next) => {
  const span = tracer.startSpan('http_request');
  req.span = span;
  next();
});
```

### 3. 添加安全事件日志

```typescript
// 记录安全相关事件
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    logger.warn('Sensitive operation', {
      method: req.method,
      path: req.path,
      userId: req.user?.id,
    });
  }
  next();
});
```

### 4. 集成速率限制

使用 `@nestjs/throttler`：

```typescript
// 在控制器中使用
@Throttle(5, 60)  // 60秒内最多5次请求
@Post('login')
login() { }
```

## 故障排查

### 问题：日志文件无权限

**解决方案**：确保 `logs` 目录存在且应用有写权限

```bash
mkdir -p logs
chmod 755 logs
```

### 问题：CORS 请求被阻止

**解决方案**：检查环境变量 `CORS_ORIGINS` 是否正确配置，或修改 `init-app.ts` 中的 CORS 配置

### 问题：验证错误消息不清晰

**解决方案**：修改 `init-app.ts` 中 `ValidationPipe` 的 `exceptionFactory` 方法

## 相关文件

- [main.ts](../main.ts) - 应用入口
- [src/config/](../config/) - 配置模块
- [src/infrastructure/logger/](../infrastructure/logger/) - 日志服务

## 最佳实践

1. ✅ **提前初始化日志** - 确保能记录所有启动过程
2. ✅ **分离关注点** - 每个初始化函数职责单一
3. ✅ **使用环境变量** - 不同环境使用不同配置
4. ✅ **记录启动信息** - 便于问题排查
5. ✅ **异步初始化** - 使用 async/await 处理异步操作
6. ✅ **错误处理** - 在 main.ts 中捕获启动错误

## 参考资源

- [NestJS 官方文档 - 应用初始化](https://docs.nestjs.com/)
- [Winston 日志库](https://github.com/winstonjs/winston)
- [OWASP 安全最佳实践](https://owasp.org/)
