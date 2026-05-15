# 六爻前端 · liuyao-web

## 项目简介

基于 **Next.js（App Router）+ React + TypeScript** 的六爻 **起卦与排盘结果** Web 应用。界面与 HTTP 请求在本仓库；装卦、持久化与规则计算在 **Spring Boot 后端**（开发期默认 `http://127.0.0.1:8080`）。**后端 API 契约**见 **liuyao_back** 仓库 **[architecture.md](../liuyao_back/architecture.md)**。

**正式文档仅以下三份**（互相引用，与代码同步）：

| 文档 | 内容 |
|------|------|
| [README.md](README.md) | 项目简介、技术栈、本地运行、文档索引 |
| [PROJECT.md](PROJECT.md) | 产品定位、核心功能、用户流程 |
| [architecture.md](architecture.md) | 技术选型、目录与模块、**前后端接口与数据约定**、设计决策与附录 |

**补充**：交互级规划见 [.cursor/plans/](.cursor/plans/)（如用神点选与确认流）；与后端对接备忘见 [草稿.md](草稿.md)（**非正式**，以 PROJECT/architecture 为准）。远期方法论与 144 地支网格图表规划见 [docs/](docs/)（`offline-evaluation-…`、`yongshen-dizhi-…`）；新协作者 **Apple Silicon Mac 装机**见 [docs/collaborator-mac-setup.md](docs/collaborator-mac-setup.md)。

编写约定见 `.cursor/rules/global_rules.md`（含「项目文档（补充）」）。

## 技术栈

| 类别 | 选用 |
|------|------|
| 框架 | Next.js 15、React 18 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS；布局约定见 `.cursor/rules/UI.md` |
| UI 组件 | 部分 shadcn/ui；业务组件见 `components/` |

## 本地运行方式

```bash
npm install
npm run dev
```

浏览器访问 **http://localhost:3000**。排盘前请先启动 **后端**（端口以实际配置为准，常见 `8080`）。

更多实现细节见 **[architecture.md](architecture.md)**。
