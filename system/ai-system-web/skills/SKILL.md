---
name: frontend-react-mui
description: React + MUI 前端开发规范（Minimals 模板、组件规范、页面生成）。在 system/ai-system-web 开发、编写页面/组件、新增路由或修改前端代码时使用。遵循 docs/ 中的架构与规范。
---

# Frontend React + MUI 开发规范

本 skill 适用于 `system/ai-system-web` 的前端开发，技术栈：React 19+ + Vite + MUI + Minimals 模板。

## 1. 前置条件

1. 在生成代码后，忽略 eslint 的导入排序问题，由开发者自行排序
2. 所有 UI 组件如果样式太多且多次重复使用，用 MUI 的 `styled` 封装好组件后再用
3. UI 组件重复的话一定抽出来，封装复用

## 2. 技术栈

- **框架**：React 19+ + TypeScript
- **构建工具**：Vite
- **UI 框架**：MUI (Material-UI)
- **模板体系**：Minimals
- **路由**：React Router
- **表单处理**：react-hook-form + zod
- **HTTP 客户端**：axios（通过 `src/lib/axios.ts` 封装）
- **其他依赖**：以 `package.json` 为唯一准则

## 3. 代码规范

### 3.1 组件规范

- **只使用 Function Component**，不要使用 `React.FC` 类型
- 组件命名使用 PascalCase，文件使用 kebab-case（如：`lessor-orders-view.tsx`）
- 优先使用 React Hooks
- **禁止** class component、`any` 类型
- 页面组件统一命名为 `Page` 并默认导出；View 组件使用具名导出
- 重复组件逻辑必须封装，公共组件放 `src/components`，业务组件放 `src/sections/{module}/components`

### 3.2 目录结构

```
src/
  pages/          # 页面入口（路由定义）
  sections/       # 页面组件和业务逻辑
    {module}/
      view/       # 页面视图组件
      components/ # 业务组件
      *.tsx       # view 抽离的大组件
  components/     # 全局公共组件
  routes/         # 路由配置
  lib/            # 工具库和封装
  layouts/        # 页面 layout
  theme/          # MUI 样式、主题配置
```

### 3.3 状态与请求

- 页面状态：`useState` / `useReducer`
- 表单：优先 `react-hook-form`
- 接口请求：必须通过 `src/lib/axios.ts`，禁止直接 `fetch` / `axios`
- 分页/上拉加载：使用 `@tanstack/react-query`，无限滚动用 `useInfiniteQuery` + `LoadMore`

### 3.4 类型定义

- 所有接口响应必须定义类型，禁止 `any`，不确定时用 `unknown`

## 4. UI/UX 规范

### 4.1 设备与布局

- **Mobile First**，兼容 iOS / Android WebView / 现代浏览器
- 避免固定宽度，使用 MUI Grid / 相对单位
- **必须支持**深色/浅色模式，颜色使用主题变量
- 间距使用 MUI spacing 系统（8px 基准）

### 4.2 交互

- 点击区域最小 44x44px
- 重要操作：ripple、loading、Snackbar 反馈
- 弹窗最多一层，移动端优先 `Drawer` 而非 `Dialog`
- 列表页必须支持上拉加载更多

### 4.3 MUI 使用

- 优先 MUI 组件，样式用 `sx` 或 `theme`
- 复杂样式用 `styled` API
- 图标：优先 `src/components/iconify/icon-sets.ts`，其次 `lucide-react`

### 4.4 性能与可访问性

- 图片懒加载，长列表虚拟滚动（如需要）
- 使用 `React.memo`、`useMemo`、`useCallback`
- 加载时显示骨架屏
- 交互元素有 `aria-label`，表单有 `label`

## 5. 页面生成规范

### 5.1 文件结构

| 类型     | 路径                                      |
| -------- | ----------------------------------------- |
| 页面入口 | `src/pages/{module}/index.tsx`             |
| 页面组件 | `src/sections/{module}/view/`              |
| 路由配置 | `src/routes/sections/index.tsx` 或独立文件 |
| 路径常量 | `src/routes/paths.ts`                      |

### 5.2 元数据

- **禁止** `react-helmet-async` 的 `Helmet`
- **必须** metadata 对象 + 直接渲染 `<title>`、`<meta>`

### 5.3 页面模板

```tsx
"use client";

import { MyView } from "src/sections/my/view";

const metadata = { title: "我的", description: "..." };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <MyView />
    </>
  );
}
```

### 5.4 检查清单

- [ ] `src/pages/` 创建页面入口
- [ ] `src/sections/` 创建页面组件
- [ ] 路由配置 + `paths.ts` 路径常量
- [ ] 骨架屏、列表上拉加载
- [ ] 元数据、深色/浅色模式、动画效果

## 6. 红线（禁止）

- 使用 `any` 类型
- 直接 `fetch` / `axios`，不通过 `src/lib/axios.ts`
- 使用 `react-helmet-async` 的 `Helmet`
- 硬编码颜色值
- 直接操作 DOM
- 列表查询不分页/无上拉加载

## 7. 详细文档

完整规范见项目文档：

- [README.md](../docs/README.md) - 文档索引与阅读顺序
