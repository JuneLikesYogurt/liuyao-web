# architecture · liuyao-web（架构说明）

与代码同步更新（见 `.cursor/rules/global_rules.md`「项目文档（补充）」）。

**关联文档**：[README.md](README.md) · [PROJECT.md](PROJECT.md) · 后端契约 **[liuyao_back/architecture.md](../liuyao_back/architecture.md)**

---

## 技术选型及原因

| 技术 | 用途 | 说明 |
|------|------|------|
| Next.js 15 App Router | 全栈 React | 服务端取数、API Route 代理、同源减轻 CORS |
| TypeScript | 类型约束 | 与 `lib/api.ts` 中类型对齐 |
| Tailwind CSS | 样式 | 与 `.cursor/rules/UI.md` 配合 |
| shadcn/ui | 基础 UI | Button、Card 等 |

**后端**：开发期默认 **`http://127.0.0.1:8080`**（Spring Boot）。**HTTP 路径、鉴权、响应字段与爻位约定** 以 **liuyao_back** 仓库 **[architecture.md](../liuyao_back/architecture.md)** 为准；生产 Base URL 由前端环境变量配置。

---

## 运行时关系

| 组件 | 默认地址 | 说明 |
|------|----------|------|
| Next.js | `http://localhost:3000` | 浏览器只访问本站；部分请求经 **API Route** 代理到后端 |
| Spring Boot | `http://127.0.0.1:8080` | 业务 API；`lib/api.ts`、`app/api/*/route.ts` 中 Base URL 应可配置 |

---

## 后端 API 契约（索引）

以下与 **liuyao_back** 的 `SecurityConfig`、Controller 保持一致。变更时 **先改 [liuyao_back/architecture.md](../liuyao_back/architecture.md)，再改本仓库代理与类型**。

| 能力 | 后端路径（摘要） | 前端侧 |
|------|------------------|--------|
| 注册 / 登录 | `POST /auth/register`、`POST /auth/login` | `/api/auth/*` 或直连 |
| 起卦入库 | Spring：`POST /?title&date&result`（**仅 query**，需 JWT） | 浏览器：`POST /api/cast`，**JSON body** `{ title, date, result }`；Route 读 JSON 后拼 query 调 Spring；`Authorization` 透传（见 `castLiuYao` / `app/api/cast/route.ts`） |
| 卦象详情 | `GET /result?liuyao_id=`（需 JWT，仅记录所属用户） | `GET /api/result`；Route 与 `getLiuYaoDetail` 转发 **`Authorization: Bearer`**（服务端由 **`token` cookie** 注入） |
| 用神计数 | `GET /result/countYongshen`（需 JWT，仅记录所属用户） | `GET /api/result/count-yongshen` → `{ value }`；浏览器经 `fetchCountYongshen` 带 Bearer |
| 历史（本人） | `GET /history`（需 JWT；`q`、`page`/`size`） | `/api/history` |
| 管理 · 全站历史 | `GET /admin/history`（需 ADMIN） | `/api/admin/history` |

鉴权、字段、`GuaDetailDto` 爻位下标、用神 `yongshen` 1～6 等**完整说明**见 **[liuyao_back/architecture.md](../liuyao_back/architecture.md)**，此处不重复维护。

### 前端会话与路由守卫（Next.js）

- **登录页** [`/login`](app/login/page.tsx)、**注册页** [`/register`](app/register/page.tsx) 与 **`/api/auth/*`** 匿名可访问；其余页面默认需已登录（由根目录 [`middleware.ts`](middleware.ts) 拦截）。
- 未登录访问受保护路径时重定向到 **`/login?next=<原路径+查询串>`**；登录成功后客户端写入 **`localStorage`**（兼容既有 `fetch`）并写入同名 **`token` cookie**（`path=/`，供 middleware 识别）。
- **`next` 回跳**：仅允许站内相对路径（以 `/` 开头且非 `//`），避免开放重定向。
- 已携带有效 **`token` cookie** 时访问 **`/login`**：重定向到 **`next`**（若合法）或 **`/`**，避免重复停留在登录页。
- **Middleware 与 JWT（重要）**：[`middleware.ts`](middleware.ts) 仅对 Cookie 中的 JWT **解码 payload** 并校验 **`exp` 未过期**，**不验证签名**（Edge 层不持有 `jwt.secret`）。用途是 **路由/UX 门禁**（是否重定向到登录），**不是**身份认证的权威边界。**真实鉴权**在 **Spring**（`JwtAuthenticationFilter` + `JwtService` 验签）。因此可能出现「页面放行但接口 401」的短暂不一致；`/api/*` 不经页面式重定向拦截，由后端或 Route 返回 401。

---

## 项目结构（目录）

```text
app/                 # 页面与路由（App Router）
  api/               # Next Route：代理 cast、result 等
  history/result/... # 各路由 page.tsx
components/          # 业务组件（liuyao、result/*）
lib/                 # api 封装、utils
.cursor/rules/      # Cursor 规则（含 global_rules.md、UI.md）
```

---

## 核心模块

| 模块 | 路径 | 职责 |
|------|------|------|
| 起卦与提交 | `app/page.tsx`、`components/cast/hexagram-cast-panel.tsx`、`lib/liuyao-cast.ts` | 六次逐爻摇卦 / 手动录入、`castLiuYao` |
| 结果展示 | `app/result/page.tsx`、`components/result/*` | `getLiuYaoDetail`、本卦/变卦/动爻 UI；**规划中**：爻位点选用神、确认、调用用神接口、下方结果区 |
| API 代理 | `app/api/cast/route.ts`、`app/api/result/route.ts`、`app/api/result/count-yongshen/route.ts` 等 | 转发到 Spring，**转发 Authorization**；**错误体**经 [`lib/proxy-upstream-error.ts`](lib/proxy-upstream-error.ts) 脱敏（生产不附带上游原文，开发可带 `debugSnippet`） |
| HTTP 客户端 | `lib/api.ts` | `castLiuYao`、`fetchCountYongshen`（Bearer）、`getLiuYaoDetail`（cookie→Bearer）、类型定义 |

---

## 数据模型与爻位约定

服务端 JSON 字段以 **[liuyao_back/architecture.md](../liuyao_back/architecture.md)** 为准；下列为前端 `lib/api.ts` 与排盘 UI 对齐要点。

### TypeScript 类型（`lib/api.ts`）

- **`LiuYaoDetail`**：`liuyao_id`、`title`、`date`、`bengua` / `biangua`（`GuaInfo`）、`mingdong`、`year`…
- **`GuaInfo`**：`gua_id`、`yao_zhi[]`、`yao_liuqin[]`、可选 `yao_gan[]`（与 `yao_zhi` 同序；库表 `yao1_gan` 为初爻即索引 0）、可选 **`yao_zhi_fu[]` / `yao_liuqin_fu[]`**（伏神地支/六亲，与 `yao_zhi` 同下标；库表 `yao1_*_fu` 为初爻）、`shi` / `ying` 等

### 用神参数（约定）

- **HTTP 参数名**：与现有后端一致时使用 `yongshen`（见 `GET /result/countYongshen`）。
- **语义**：**爻位整数**，**1 = 初爻**，**6 = 上爻**；与 `shi`/`ying` 相同编号体系，与 UI 行 `index` 的关系为 **`yongshen = index + 1`**（`yao_zhi` / `yao_liuqin` 使用 `index ∈ [0,5]`）。

### `gua_id` 与并行数组（避免画错卦）

- **`gua_id`**：六位阴阳串，**索引 0 = 上爻，索引 5 = 初爻**（自上而下）。
- **`yao_zhi` / `yao_liuqin` / `yao_gan` / `yao_zhi_fu` / `yao_liuqin_fu` / `bengua_liushou_by_yao`**：**索引 0 = 初爻，索引 5 = 上爻**（与 `gua_id` 字符顺序相反）。
- **前端**：用同一套行 `index`（如 `index = 5 - i` 表示从上往下第几行）驱动六亲、地支、天干、伏神、六兽时，对 **`gua_id` 取字符** 使用 **`guaId[5 - index]`**（或等价形式），与 `components/result/ben-gua-detail.tsx` 实现一致。伏神在结果排盘中以 **爻主行下方** 副行展示（`components/result/gua-module.tsx` 的 `GuaYaoRowView`），文案由六亲伏、地支伏拼成「伏 …」，**红色**（`text-red-600`）。排盘区由 **`components/result/result-pan-grid.tsx`** 用 **CSS Grid** 整盘对齐（列：六兽 / 本卦 / 动爻 / 变卦；每爻一行），符合 `.cursor/rules/UI.md`。并行数组在渲染前经 **`lib/result-pan-zip.ts`** 的 `zipPanYaoRows` 合并为六行视图模型（长度契约由 Vitest 覆盖）；`GuaYaoRowView` 在 Grid 内使用 **`fushenSlotReserved`**，无伏神也保留副行高度，与侧列对齐。

### 首页摇卦线 `LiuYaoLine`

- `0|1|2|3`：太阴 / 少阳 / 少阴 / 太阳；`lines[0]` 为 **上爻**；组件内自下而上绘制。第 `k` 次摇卦写入 `lines[6-k]`；提交前经 `linesToResultString` 反转为初爻在前的 `result` 串。

### 用户（后端）

- 用户主键与 JWT subject 对齐；密码仅存哈希；邮箱用于登录时与 `identifier` 规则一致（以后端表结构为准）。

---

## 关键设计决策

1. **起卦走 `/api/cast` 代理**：浏览器用 **JSON** 调 Next；Next 调 Spring 时改为 **query 参数**（与后端 `YaoGuaController` 一致），并转发鉴权头。
2. **结果页**：Server Component 经 **`getLiuYaoDetail` → 同源 `/api/result`**，与浏览器代理路径一致；鉴权由 **`token` cookie** 转 Bearer。
3. **排盘 UI**：使用 **grid** 保证六爻列对齐（见 `UI.md`）。
4. **用神**：用户输入落在 **爻位**；确认后再请求；结果区在排盘之下。未来 **干支试算、图表** 放在折叠高级区与结果区扩展，不替换六爻 grid（见 [PROJECT.md](PROJECT.md)）。
5. **登录前置**：全站（除登录、注册、认证 API 等白名单）由 middleware 要求会话；与 [PROJECT.md](PROJECT.md)「先登录再使用主流程」一致。

---

## 工程配置（建议）

- 使用 **`API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`** 等环境变量替换硬编码 `127.0.0.1:8080`。
- 历史分页：解析 Spring `Page` 的 `content` 数组。
- **单元测试**：`npm test` 运行 Vitest（`vitest.config.ts`）；当前覆盖 `lib/result-pan-zip.ts` 等纯逻辑。

### 结果排盘 Grid（手测清单）

- **无变卦**：仅两列，卦名行与六爻不错行；有伏神时本卦副行与六兽第二占位行对齐。
- **有变卦**：四列，动爻符号与箭头、变卦爻与侧列对齐。
- **用神**：点本卦爻打开确认框；键盘 Enter / Space 可激活可点爻块（`GuaYaoRowView`）。
- **主行齐平**：扫视六兽、本卦、动爻、变卦主行，垂直中心无明显高低台阶（本卦可点态无额外竖直 padding）。
- **伏神贴缝**：爻行间以 `gap-y-px` 与主–伏 `gap-0` 为主，伏神紧贴主行下方。
- **伏神文案**：六亲伏与地支伏之间含空格（`ben-gua-detail.tsx` 的 `fushenDisplayText`）。

---

## 附录：页面与调用链（实现细节）

若与代码不一致，**以代码为准**。

### 页面概览

- **布局** `app/layout.tsx`：全局样式、顶栏导航、页脚。
- **路由守卫** `middleware.ts`：未登录重定向登录；已登录访问 `/login` 时离开登录页。
- **登录 /login** `app/login/page.tsx`：鉴权、token 落盘与回跳。
- **注册 /register** `app/register/page.tsx`：注册表单；与登录页互链。
- **首页 /** `app/page.tsx`：六次摇卦或手动录入、可选标题、排盘、`LiuYao` 预览。
- **结果 /result** `app/result/page.tsx`：`searchParams.liuyao_id`，`getLiuYaoDetail`。
- **历史 /history** `app/history/page.tsx`：仅本人；搜索、分页、URL 同步（共用 `HistoryListView`）。
- **管理 /admin/history** `app/admin/history/page.tsx`：ADMIN 全站 + `userId` 筛选 + 用户名；顶栏 `SiteNav` 仅 ADMIN 显示「管理」。
- **登录 /login**：登录响应 `role` 写入 `localStorage`（`user_role`）。
- **API Route**：`app/api/cast/route.ts`、`app/api/history/route.ts`、`app/api/admin/history/route.ts`、`app/api/result/route.ts`、`app/api/result/count-yongshen/route.ts`。

### 调用链摘要

- 起卦：`castLiuYao` → **`POST /api/cast`**（JSON body）→ **`POST /?...`**（query，带 Bearer）。
- 结果：`getLiuYaoDetail` → **`GET /api/result?liuyao_id=`**（cookie `token` → `Authorization: Bearer`）→ 后端 `GET /result`。
- 用神计数（浏览器）：`fetchCountYongshen`（localStorage `token` → Bearer）→ **`GET /api/result/count-yongshen`** → 后端 `GET /result/countYongshen`。

### 已知改进方向（非阻塞）

- 结果 URL 可改为 `/result/[liuyao_id]`。
- 导航高亮、环境变量、错误与 loading、历史项跳转详情。
