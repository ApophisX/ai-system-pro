# 小程序开发规范 (Taro)

本目录为 Taro 小程序开发规范说明，供 Miniapp Agent 及开发者参考。

## 完整规范

- **Agent 配置**：[agents/miniapp-agent.md](../../../agents/miniapp-agent.md) - 目录结构、技术栈、开发规范、常用命令
- **Cursor 规则**：`.cursor/rules/miniapp.mdc` - 编辑 `system/ai-system-miniapp` 时自动应用

## 技术栈

| 类别     | 技术                          |
| -------- | ----------------------------- |
| 框架     | Taro 4.x                      |
| 语言     | TypeScript                    |
| UI       | React 18 + Less + TailwindCSS |
| 数据请求 | SWR / @tanstack/react-query   |
| API 生成 | @umijs/openapi (openapi2ts)   |

## 目录结构

- `src/pages/` - 页面（按路由划分）
- `src/sections/` - 页面级业务区块
- `src/components/` - 通用组件
- `src/services/` - API 服务（含 openapi2ts 生成）

## 相关资源

- `share-doc/api-spec/` - OpenAPI 契约，与 Backend 同步
- `pnpm api` - 根据 OpenAPI 生成 API 代码
