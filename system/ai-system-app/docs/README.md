# Flutter 移动端开发规范

本目录为 Flutter 移动端开发规范说明，供 Mobile Agent 及开发者参考。

## 完整规范

- **Agent 配置**：[agents/mobile-agent.md](../../../agents/mobile-agent.md) - 目录结构、技术栈、开发规范
- **Cursor 规则**：`.cursor/rules/mobile.mdc` - 编辑 `system/ai-system-app` 时自动应用

## 技术栈

- **框架**：Flutter
- **语言**：Dart

## 目录结构（规划）

- `lib/screens/` - 页面
- `lib/widgets/` - 通用组件
- `lib/services/` - API 服务

## 相关资源

- `share-doc/api-spec/` - OpenAPI 契约，与 Backend 同步
- API 与 Web/小程序共用，请求/响应格式一致
