# 六爻前端 · liuyao-web

基于 **Next.js (App Router) + React + TypeScript + TailwindCSS + shadcn/ui** 的六爻起卦前端项目。

## 启动项目

在 `liuyao-web` 目录下：

```bash
npm install
npm run dev
```

默认开发地址为 `http://localhost:3000`。

## 目录结构

```text
liuyao-web
├─ app
│  ├─ history
│  │  └─ page.tsx        # 历史记录页 /history
│  ├─ result
│  │  └─ page.tsx        # 结果页 /result
│  ├─ globals.css        # Tailwind & 全局样式（含 shadcn 变量）
│  ├─ layout.tsx         # 根布局
│  └─ page.tsx           # 起卦首页 /
├─ components
│  └─ ui
│     ├─ button.tsx      # shadcn 按钮组件
│     └─ card.tsx        # shadcn 卡片组件
├─ lib
│  └─ utils.ts           # 工具函数（cn）
├─ components.json       # shadcn/ui 配置
├─ tailwind.config.ts    # Tailwind 配置
├─ postcss.config.mjs    # PostCSS 配置
├─ next.config.mjs       # Next.js 配置
├─ tsconfig.json         # TypeScript 配置
├─ package.json          # 依赖与脚本
└─ next-env.d.ts         # Next.js TS 声明
```



## 六爻前端现状说明文档

### 1. 当前前端页面结构

- **整体技术栈**
  - Next.js App Router（`app` 目录）
  - React 函数组件 + TypeScript
  - TailwindCSS + 自定义主题变量
  - 少量 shadcn/ui 组件（`Button`、`Card`）
  - 自定义 `LiuYao` 卦象组件

- **布局层**
  - `app/layout.tsx`
    - 定义全局 `<html lang="zh-CN">` 和 `<body>`，引入 `globals.css`
    - 头部 `header`：
      - 左侧：圆形“卦”字徽标 + 标题“六爻起卦”+ 副标题
      - 右侧：导航 `navItems = ["/", "/result", "/history"]`，目前通过 `data-active` 预留激活态但还未真正判断路由
    - 主体 `main`：`container` 包裹 `children`，留出上下留白
    - 页脚 `footer`：版权年份 + 技术栈说明

- **起卦页 `/`**
  - 文件：`app/page.tsx`（Client Component）
  - 功能结构：
    - 标题“起卦”+ 文案：“心中默念所问之事，轻按下方按钮静待卦象显现”
    - 文本域：可选问题描述 `question`
    - 按钮：
      - “起卦”按钮：触发三枚铜钱旋转动画 + 随机生成六爻结果
      - “排盘”按钮：起卦完成后出现，用于调用后端起卦 API 并跳转结果页
    - 动画区域：三枚铜钱圆形卡片，使用 CSS `spin` 动画
    - 卦象预览：使用 `LiuYao` 组件展示当前摇卦结果（本卦+动爻）

- **结果页 `/result`**
  - 文件：`app/result/page.tsx`（Server Component）
  - 从 `searchParams.liuyao_id` 读取当前六爻记录 id
  - 通过 `getLiuYaoDetail` 从后端获取完整 `LiuYao` 记录 JSON
  - 布局结构：
    - 标题：使用 `detail.title || "起卦"`
    - 副标题：`detail.date`
    - 第一块信息卡片：
      - “年月日时”：拼接 `year month day hour`
      - “旬空”：`xunkong`
    - 第二块信息卡片：卦象区
      - 若有变卦：本卦图例 + 变卦图例左右并列
      - 若无变卦：仅显示本卦图例
      - 卦象图例均复用 `LiuYao` 组件
    - 底部操作：返回起卦 / 历史记录的链接

- **历史记录页 `/history`**
  - 文件：`app/history/page.tsx`
  - 当前是静态占位页：
    - 使用 `mockItems` 数组展示两条假数据卡片
    - 提示未来可做分页、筛选、详情等
    - 提供“返回起卦”“查看示例结果”链接

- **API Route**
  - `app/api/cast/route.ts`：代理 POST 到后端起卦接口
  - `app/api/result/route.ts`：代理 GET 到后端结果接口（目前前端未使用）

---

### 2. API 调用方式

- **起卦（排盘）API：通过 Next 内部代理**
  - 封装函数：`lib/api.ts` → `castLiuYao(params: { title; date; result })`
    - 客户端调用 `fetch("/api/cast")`（同源，避免浏览器 CORS 问题）
    - 期望后端最终返回 JSON `{ liuyao_id }`
  - 代理层：`app/api/cast/route.ts`
    - 读取 body 中的 `title/date/result`
    - 拼接为 `http://127.0.0.1:8080/?title=...&date=...&result=...`，用 Node 环境 `fetch` 调用后端
    - 尝试解析响应（支持纯数字/JSON），统一返回 `{ liuyao_id }`
  - 触发点：`app/page.tsx` 中 `handlePan`：
    - 把 `lines: LiuYaoLine[]` 反转（上爻→下爻）再 join 成 `result` 字符串
    - 生成当前时间字符串 `yyyy-MM-dd HH:mm:ss` 作为 `date`
    - 成功后 `router.push("/result?liuyao_id=...")`

- **结果查询 API：直接从 Server Component 调后端**
  - 封装函数：`lib/api.ts` → `getLiuYaoDetail(liuyaoId)`
    - 在服务端直接 `fetch("http://127.0.0.1:8080/result?liuyao_id=...")`
    - 关闭缓存 `cache: "no-store"`
  - 使用点：`app/result/page.tsx` 顶部 `const detail = await getLiuYaoDetail(liuyaoId);`
  - 注意：虽然有 `app/api/result/route.ts` 代理，但目前 **未被前端使用**（结果页直接连后端）。

---

### 3. 数据结构

- **卦象可视化：`LiuYaoLine` / `LiuYao` 组件**
  - 类型：
    - `export type LiuYaoLine = 0 | 1 | 2 | 3;`
    - 约定：
      - `0` = 太阴（动阴）
      - `1` = 少阳
      - `2` = 少阴
      - `3` = 太阳（动阳）
    - `lines: LiuYaoLine[]`：
      - 长度为 6
      - **`lines[0]` 为上爻（六爻），`lines[5]` 为下爻（初爻）**
  - 渲染逻辑：
    - 内部 `indices = [5,4,3,2,1,0]`，保证视觉上“从下往上”排列六爻
    - 每行：
      - 阳爻（1 或 3）：一条实线
      - 阴爻（0 或 2）：两段线中间断开
      - 动爻（0 或 3）：
        - 太阴：右侧显示一个 `×`
        - 太阳：右侧显示一个空心圆圈
      - 静爻：无标记

- **后端数据：`LiuYaoDetail`**
  - 定义在 `lib/api.ts`：

    ```ts
    export interface LiuYaoDetail {
      liuyao_id: number;
      title: string | null;
      date: string | null;
      bengua_id: string | null;   // 0/1，0=阴、1=阳，6位
      biangua_id: string | null;  // 0/1/a/b，a=太阴变阳，b=太阳变阴
      mingdong: string | null;    // 动爻位置，"1,3,6,"
      year?: string | null;
      month?: string | null;
      day?: string | null;
      hour?: string | null;
      xunkong?: string | null;
      [key: string]: unknown;
    }
    ```

  - 在结果页中：
    - `parseMoving(mingdong)`：解析 `"1,3,"` → `[1,3]`（一至六爻）
    - 若 `mingdong` 为空，则从 `biangua_id` 中 `a/b` 推断动爻位置（`parseMovingFromBianGua`）
    - `buildBenGuaLines(bengua_id, moving)`：
      - 通过本卦 0/1 + 动爻列表生成 `LiuYaoLine[]`（结合动阴/动阳表示）
      - 注意：后端 `bengua_id[0]` 是一爻（下），前端再映射到 `lines[5]` 等位置
    - `buildBianGuaLines(biangua_id)`：
      - 根据变卦 0/1/a/b 映射出变卦最终阴阳（1=阳、2=阴），不显示动爻标记

- **首页本地状态**
  - `question: string`：用户问题
  - `phase: "idle" | "casting" | "done"`：起卦流程状态机
  - `lines: LiuYaoLine[] | null`：当前本卦随机摇卦结果
  - `submitting: boolean`：是否正在调用排盘 API

---

### 4. 页面之间的跳转逻辑

- **顶部导航栏**
  - `layout.tsx` 中 `navItems = ["/", "/result", "/history"]`
  - 使用 `next/link` 切换页面
  - 目前 `data-active={false}` 写死，将来可根据 `usePathname()` / Segment 实现真实高亮

- **起卦页 → 结果页**
  - `handlePan` 调用起卦 API 成功后：

    ```ts
    router.push(`/result?liuyao_id=${encodeURIComponent(liuyao_id)}`);
    ```

  - 即通过 query string 携带 `liuyao_id`，结果页在 server 端读取 `searchParams`。

- **结果页 → 其他页**
  - 底部按钮：
    - 返回起卦：`<Link href="/" />`
    - 历史记录：`<Link href="/history" />`

- **历史记录页 → 其他页**
  - 静态链接：
    - 返回起卦：`/`
    - 查看示例结果：`/result`（目前不带 id，结果页会提示“请从起卦页面开始排盘”）

---

## 存在的问题与未来可能需要修改的地方

### 结构与路由设计

- **结果页依赖 query 参数而不是路径参数**
  - 当前路径模式为 `/result?liuyao_id=123`，更语义化的方式是 `/result/123`（App Router 中的 `app/result/[liuyao_id]/page.tsx`）。
  - 现在的写法在 SEO、分享链接上略差，且 query 解析逻辑手写略繁琐。

- **导航 active 状态未实现**
  - `data-active={false}` 写死，顶部导航不会根据当前路径高亮，影响用户的“当前所在位置感知”。
  - 推荐使用 `usePathname()` 或 Segment props 实现 active 状态。

- **`/api/result` 代理未被使用**
  - 前端 Server Component 直接 `fetch("http://127.0.0.1:8080/…")`，而不是走 `/api/result`。
  - 当前是可行的，但产生“有 API Route 却不用”的不一致：
    - POST（起卦）通过 `/api/cast` 代理
    - GET（结果）直接连后端
  - 未来如果要部署到不同域名/环境，最好统一通过自己的 API Route，集中处理异常与地址。

- **历史记录页仍是纯静态占位**
  - 暂无真实 API 和跳转逻辑（点击历史项不会跳到某个 `liuyao_id` 的结果页）。
  - 未来很大概率要：
    - 调用后端（例如 `/history?user_id=...`）
    - 为每条记录提供链接 `/result/[id]`。

### API 与数据层

- **`BASE_URL` 硬编码**
  - `lib/api.ts` 和 API Route 中都直接写了 `http://127.0.0.1:8080`：
    - 不利于区分开发/生产环境
    - 若端口或路径变更需到处改
  - 建议：
    - 使用环境变量（如 `process.env.NEXT_PUBLIC_API_BASE_URL` 或 `process.env.API_BASE_URL`）
    - 前端 fetch 统一从一处配置拿 base URL

- **结果获取混用同源/跨域方式**
  - 起卦（POST）已通过 `/api/cast` 代理避免 CORS
  - 结果（GET）仍直连 `127.0.0.1`，如果将来前后端跨域部署，可能遇到：
    - Server Component 还能直连（在 Node 环境 OK）
    - 但如果改成 Client fetch，就会遇到 CORS
  - 推荐：保持统一的“前端只打自己域名的 API Route”，由后端代理层去访问 Spring Boot。

- **错误处理不够友好**
  - 起卦失败：
    - `handlePan` 中只 `console.error(e);` 并取消 `submitting`，页面没有任何视觉反馈。
  - 结果获取失败：
    - `getLiuYaoDetail` 抛异常，`ResultPage` 没有 try/catch 包裹，因此会直接让整个页面报错。
  - 未来应考虑：
    - UI 级的错误状态提示（Toast/轻量 Alert）
    - 替代内容（错误卡片 + “返回起卦”按钮）

### UI 与组件设计

- **`LiuYao` 组件没有显式表达“本卦/变卦”语义**
  - 目前通过两次调用 `LiuYao` 来表现“左本卦右变卦”，但组件本身是“无语义的纯卦象渲染”。
  - 未来如果要：
    - 标注“本卦”/“变卦”
    - 在同一组件内支持“对比模式”
  - 可能需要：
    - 在父层做简单文案标注，或
    - 设计一个更语义化的 `LiuYaoPair` 容器组件。

- **动画与状态耦合在首页单文件**
  - 三枚铜钱动画与状态机全部写在 `app/page.tsx` 中：
    - 目前体量不大可接受
    - 如果未来增加“不同起卦方式 / 复杂表单 / API loading 状态”，`page.tsx` 可能变得过于臃肿
  - 可选重构方向：
    - 提取 `CoinAnimation` 组件
    - 把“起卦状态机 + 数据”封装到自定义 hook（例如 `useCasting()`）

- **结果页没有加载中状态**
  - 因为是 Server Component，Next 会自动等待数据后再渲染，但在慢网环境中用户会只看到“白屏等待”。
  - 可以考虑：
    - 定义一个 `loading.tsx`（App Router 的 Loading UI）
    - 或更细粒度的数据加载策略（如将卦象部分拆成 Client Component + Suspense）

### 代码组织与扩展性

- **README 对后端依赖几乎没有说明**
  - 仅说明“Next + Tailwind + shadcn”，没有提示：
    - 需要后端 `127.0.0.1:8080` 已启动
    - 起卦接口/结果接口的约定（query 参数、格式）
  - 建议：
    - 在 README 中增加“后端服务依赖”章节
    - 简要说明 2 个主 API（POST `/` 与 GET `/result`）的入参和返回结构

- **缺少类型层的抽象/对齐（与后端 DTO）**
  - 前端的 `LiuYaoDetail` 与后端实体较为接近，但只是简单 interface，未进一步封装：
    - 没有对 nullable 字段整理（比如 `?? "—"` 的逻辑都写在 UI 中）
    - 未抽象“本卦/变卦/动爻”的 Domain Model 类型
  - 未来如果想在多处复用同一逻辑（如历史列表/详情/导出），比现在的“临时组装”会更易维护。

---

## 建议的未来调整方向（简要）

- **路由 & API**
  - 把 `/result` 改为 `app/result/[liuyao_id]/page.tsx` 风格，减少对 `searchParams` 手工解析。
  - 统一通过 `/api/*` 调后端（包括结果查询），将 `BASE_URL` 移到环境变量。
  - 为 `/history` 设计实际数据 API，并支持点击历史记录跳转到对应 `result/[id]`。

- **用户体验**
  - 为起卦/排盘/结果加载添加视觉反馈（按钮 loading、全局 loading/page-level skeleton）。
  - 当起卦 API 或结果 API 失败时，在 UI 给出友好的提示。

- **代码与结构**
  - 提取动画和起卦逻辑为小组件/自定义 hook，减少 `page.tsx` 复杂度。
  - 为 `LiuYao` 或上层组件增加更明确的语义（例如 `LiuYaoView type="bengua" | "biangua"`，或者 `LiuYaoPair`）。

整体上，你现在的前端基础结构是合理的、干净的，已经很好地体现了“东方、极简”的 UI 风格和核心数据流。上述问题都属于“未来增强/重构”的层面，不影响你当前 MVP 的正常工作。