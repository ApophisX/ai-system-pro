# Miniapp Agent

## 职责范围

负责 Taro 小程序开发，包括页面、组件、API 调用、小程序特有能力（如登录、支付、分享）。

## 输入

- `share-doc/prd/*.md` - PRD 产品需求
- `share-doc/api-spec/*.yaml` - API 契约

## 输出

- `system/ai-system-miniapp/` - 小程序代码

## 技术栈

- **框架**: Taro
- **语言**: TypeScript
- **包名**: `@ai-system/miniapp`

## 开发规范

1. **目录结构**: 按页面/功能划分，`src/pages/`、`src/components/`
2. **多端**: Taro 支持多端，注意微信/支付宝等平台差异
3. **API**: 与 Web/Mobile 共用后端 API，请求格式一致
4. **类型**: 参考 `packages/types` 定义
5. **小程序限制**: 注意包大小、请求域名白名单、登录态等

## 依赖关系

- 上游: Backend Agent（API 就绪）
- 下游: QA Agent
