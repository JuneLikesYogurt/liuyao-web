# architecture · liuyao-web（架构说明）

与代码同步更新（见 `.cursor/rules/global_rules.md`「项目文档（补充）」）。

**关联文档**：[README.md](README.md) · [PRD.md](PRD.md)

---

## 技术选型及原因

| 技术 | 用途 | 说明 |
|------|------|------|
| Next.js 15 App Router | 全栈 React | 服务端取数、API Route 代理、同源减轻 CORS |
| TypeScript | 类型约束 | 与 `lib/api.ts` 中类型对齐 |
| Tailwind CSS | 样式 | 与 `.cursor/rules/UI.mdc` 配合 |
| shadcn/ui | 基础 UI | Button、Card 等 |

**后端**：开发期默认 **`http://127.0.0.1:8080`**（Spring Boot）；生产环境用环境变量配置 Base URL，避免硬编码。

---

## 运行时关系

| 组件 | 默认地址 | 说明 |
|------|----------|------|
| Next.js | `http://localhost:3000` | 浏览器只访问本站；部分请求经 **API Route** 代理到后端 |
| Spring Boot | `http://127.0.0.1:8080` | 业务 API；`lib/api.ts`、`app/api/*/route.ts` 中需统一改为可配置地址 |

---

## 前后端接口约定（Spring Boot）

以下与后端 `SecurityConfig`、Controller 保持一致；若后端变更，**先改本文档再改代码**。

### 认证（匿名可访问）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/auth/register` | POST | Body：`username`、`password`（长度等以后端校验为准）。成功返回 JWT |
| `/auth/login` | POST | Body：`identifier` + `password`（`identifier` 为用户名或邮箱；兼容键名 `username`） |

**成功响应 `AuthResponse`**：`token`（JWT）、`tokenType`（`"Bearer"`）、`userId`（整数）。  
**错误**：`400` / `401`，body 形如 `{"error":"..."}`。  
**登录规则（后端）**：`identifier` trim 后，含 `@` 则按邮箱查，否则按用户名；密码与 `password_hash` BCrypt 比对。

### 起卦（排盘入库）

| 项目 | 说明 |
|------|------|
| 路径 | `POST /?title=...&date=...&result=...`（**查询参数**，非 JSON body） |
| 鉴权 | **需登录**：`Authorization: Bearer <token>` |
| 行为 | 写入 `liuyao` 等，返回 **`liuyao_id`（整数）**；响应可能是纯数字或 JSON，前端代理需兼容解析 |
| Principal | 后端从 JWT 得到 **`userId`** |

**前端**：`app/api/cast/route.ts` 转发到后端时须 **附带客户端传来的 `Authorization`**，否则将 401。

### 卦象详情

| 项目 | 说明 |
|------|------|
| 路径 | `GET /result?liuyao_id=<id>` |
| 鉴权 | **允许匿名**（与 `POST /`、`/history` 策略以后端配置为准） |
| 响应 | JSON（本卦/变卦、空亡、动静、干支等），类型见下文「数据模型」 |

### 用神计数（可选）

| 项目 | 说明 |
|------|------|
| 路径 | `GET /result/countYongshen` |
| 参数 | `liuyao_id`、`yongshen`（爻位，与后端服务约定一致） |
| 返回 | `double` |

### 历史列表

| 项目 | 说明 |
|------|------|
| 路径 | `GET /history` |
| 鉴权 | **需登录**（JWT） |
| 参数 | `page`（默认 0）、`size`（默认 20，常见上限 100） |
| 排序 | 按 `date` **降序** |
| 响应 | Spring `Page` JSON（`content`、`totalElements` 等）；项含 `liuyao_id`、`title`、`date` 等 |

### JWT 使用

- 请求头：`Authorization: Bearer <token>`
- 前端需在登录成功后保存 token，并在 **起卦、历史** 等受保护请求中携带。

---

## 项目结构（目录）

```text
app/                 # 页面与路由（App Router）
  api/               # Next Route：代理 cast、result 等
  history/result/... # 各路由 page.tsx
components/          # 业务组件（liuyao、result/*）
lib/                 # api 封装、utils
.cursor/rules/      # Cursor 规则（含 global_rules.md、UI.mdc）
```

---

## 核心模块

| 模块 | 路径 | 职责 |
|------|------|------|
| 起卦与提交 | `app/page.tsx` | 摇卦状态机、`castLiuYao` |
| 结果展示 | `app/result/page.tsx`、`components/result/*` | `getLiuYaoDetail`、本卦/变卦/动爻 UI |
| API 代理 | `app/api/cast/route.ts` 等 | 转发到 Spring，**转发 Authorization** |
| HTTP 客户端 | `lib/api.ts` | `castLiuYao`、`getLiuYaoDetail`、类型定义 |

---

## 数据模型与爻位约定

### TypeScript 类型（`lib/api.ts`）

- **`LiuYaoDetail`**：`liuyao_id`、`title`、`date`、`bengua` / `biangua`（`GuaInfo`）、`mingdong`、`year`…
- **`GuaInfo`**：`gua_id`、`yao_zhi[]`、`yao_liuqin[]`、`shi` / `ying` 等

### `gua_id` 与并行数组（避免画错卦）

- **`gua_id`**：六位阴阳串，**索引 0 = 上爻，索引 5 = 初爻**（自上而下）。
- **`yao_zhi` / `yao_liuqin` / `bengua_liushou_by_yao`**：**索引 0 = 初爻，索引 5 = 上爻**（与 `gua_id` 字符顺序相反）。
- **前端**：用同一套行 `index`（如 `index = 5 - i` 表示从上往下第几行）驱动六亲、地支、六兽时，对 **`gua_id` 取字符** 使用 **`guaId[5 - index]`**（或等价形式），与 `components/result/ben-gua-detail.tsx` 实现一致。

### 首页摇卦线 `LiuYaoLine`

- `0|1|2|3`：太阴 / 少阳 / 少阴 / 太阳；`lines[0]` 为 **上爻**；组件内自下而上绘制。

### 用户（后端）

- 用户主键与 JWT subject 对齐；密码仅存哈希；邮箱用于登录时与 `identifier` 规则一致（以后端表结构为准）。

---

## 关键设计决策

1. **起卦走 `/api/cast` 代理**：同源请求，由 Route 转发并附加鉴权头。
2. **结果页**：当前多为 Server Component 直连 `GET /result`；可改为统一走 `/api/result` 以便环境与错误处理一致。
3. **排盘 UI**：使用 **grid** 保证六爻列对齐（见 `UI.mdc`）。

---

## 工程配置（建议）

- 使用 **`API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`** 等环境变量替换硬编码 `127.0.0.1:8080`。
- 历史分页：解析 Spring `Page` 的 `content` 数组。

---

## 附录：页面与调用链（实现细节）

若与代码不一致，**以代码为准**。

### 页面概览

- **布局** `app/layout.tsx`：全局样式、顶栏导航、页脚。
- **首页 /** `app/page.tsx`：摇卦、可选标题、排盘、`LiuYao` 预览。
- **结果 /result** `app/result/page.tsx`：`searchParams.liuyao_id`，`getLiuYaoDetail`。
- **历史 /history** `app/history/page.tsx`：列表与后端对接随版本演进。
- **API Route**：`app/api/cast/route.ts`、`app/api/result/route.ts`。

### 调用链摘要

- 起卦：`castLiuYao` → `POST /api/cast` → 后端 `POST /?...`（带 Bearer）。
- 结果：`getLiuYaoDetail` → `GET /result?liuyao_id=`（或经同源代理）。

### 已知改进方向（非阻塞）

- 结果 URL 可改为 `/result/[liuyao_id]`。
- 导航高亮、统一 result 代理、环境变量、错误与 loading、历史项跳转详情。
