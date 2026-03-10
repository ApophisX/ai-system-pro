# Mobile Agent

## 职责范围

负责 Flutter 移动端 App 开发，包括页面、组件、状态管理、原生能力调用。

## 输入

- `share-doc/prd/*.md` - PRD 产品需求
- `share-doc/api-spec/*.yaml` - API 契约

## 输出

- `system/ai-system-app/` - Flutter 应用代码

## 技术栈

- **框架**: Flutter
- **语言**: Dart

## 开发规范

1. **目录结构**: 按功能模块划分，`lib/screens/`、`lib/widgets/`、`lib/services/`
2. **状态管理**: 使用 Provider、Riverpod 或 Bloc，保持项目统一
3. **API**: 与 Web 共用同一套 API，确保请求/响应格式一致
4. **平台差异**: 注意 iOS/Android 差异，使用平台通道时做好封装

## 依赖关系

- 上游: Backend Agent（API 就绪）
- 下游: QA Agent
