# 协作 Git 流程与路线图（备忘）

> **定位**：小团队 Git 分支习惯、非专业协作者「最短跑通」检查清单、以及起卦/远期功能的产品路线备忘。  
> **与正式文档的关系**：仓库根目录 **[README.md](../README.md)**、**[PROJECT.md](../PROJECT.md)**、**[architecture.md](../architecture.md)** 仍为产品与技术契约正文；编写约定见 **[.cursor/rules/global_rules.md](../.cursor/rules/global_rules.md)**（含「`docs/` 为远期备忘」说明）。本文不替代上述三份文档。

---

## 1. 和朋友协作：分支与合并（最小够用）

### 1.1 概念

- **`main` 分支**：默认可用、相对稳定的代码基线。  
- **功能分支**：为单个功能或修复从 `main` 切出的短期分支，完成后合并回 `main`，减少互相覆盖与难以回退的大改。

### 1.2 推荐流程（维护者 / 熟悉 Git 的协作者）

```bash
git checkout main
git pull origin main
git checkout -b feat/你的功能简述
# … 修改、本地验证 …
git add -A
git commit -m "feat: 简述（遵循仓库 commit 前缀习惯）"
git push -u origin feat/你的功能简述
```

在 **GitHub** 上打开 **Pull Request**，Review 通过后 **Merge** 到 `main`。合并后本地同步：

```bash
git checkout main
git pull origin main
```

### 1.3 合并冲突（简要）

当两人修改了同一文件的相近内容时，Git 可能无法自动合并。打开冲突文件，查找 `<<<<<<<`、`=======`、`>>>>>>>`，人工选择保留内容并删除标记后，再 `git add`、`git commit`、`git push`。减轻冲突的习惯：**分支尽量短命、合并前先从 `main` 拉最新**；避免多人长时间在同一文件大块修改上并行。

### 1.4 非计算机专业协作者可以怎么做

- 小改动（文案、注释、简单样式）：同样使用 **新分支 → PR → 由维护者合并**；不会用命令行时可请维护者代为建分支或直接在 GitHub 网页编辑小改动并发 PR。  
- **不要**将真实数据库口令、JWT 密钥、`.env` 中非示例内容提交进仓库或发到公开渠道。  
- 装机与命令行逐步说明见下文链到的 **[collaborator-mac-setup.md](./collaborator-mac-setup.md)**。

---

## 2. 新人「最短跑通」检查清单

面向：**第一次在本机跑通「前端 + 后端」联调**的协作者。详细命令与 MySQL、JDK 安装见 **[collaborator-mac-setup.md](./collaborator-mac-setup.md)**（Apple Silicon Mac）。

| 步骤 | 做什么 |
|------|--------|
| 1 | 本机有两个目录：**`liuyao-web`（本仓库）** 与 **`liuyao_back`（后端仓库）**，路径自定但要分清。 |
| 2 | 按装机文档安装并启动 **MySQL**，库名/账号与后端 `application.yml` 一致。 |
| 3 | 在 **`liuyao_back`** 按该仓库说明启动 Spring Boot（常见端口 `8080`）。 |
| 4 | 在 **`liuyao-web`**：复制 **[.env.example](../.env.example)** 为 `.env.local`（或项目约定文件名），按注释填写 **后端 Base URL**（无尾斜杠）；具体变量含义以 **[architecture.md](../architecture.md)** 为准。 |
| 5 | 在 **`liuyao-web`**：`npm install`，再 `npm run dev`，浏览器打开 **http://localhost:3000**。 |
| 6 | 验证：能完成需要后端的流程（如登录、起卦后排盘跳转结果页）即算跑通。 |

若维护者用 **AirDrop / 文件** 提供本机 MySQL 的 `.sql` 快照，导入命令与权限说明见 **liuyao_back** 仓库 **[docs/mysql-dump-and-share.md](../../liuyao_back/docs/mysql-dump-and-share.md)**（两仓同级克隆时的相对路径）。

**说明**：根目录 [README.md](../README.md) 目前对前端的说明较简；非专业读者若卡壳，优先按 **上表顺序**（先数据库与后端，再前端）排查。若 `architecture` 与 `.env.example` 有更新，以仓库内最新文件为准。

---

## 3. 产品规划整理（起卦与协作卫生）

### 3.1 起卦交互

- **现状（实现）**：首页一次点击通过随机数一次生成 **6 个爻**（每位 0–3），再播放短动画；**数据上已是六爻**，但**交互上**不像传统「六次摇卦」。实现见 [app/page.tsx](../app/page.tsx) 中 `generateLines` 与 `handleCast`。  
- **目标**：**六次独立操作**，每次确定一爻，自下而上累积（初爻→上爻）；最终提交给后端的 **`result` 字符串** 与现有一致（初爻在前、上爻在后；前端 `lines` 若仍为上爻在 `lines[0]`，提交前需 `reverse` 再拼接，与当前注释一致）。  
- **布局**：六爻展示与进度区域优先使用 **CSS Grid**，与 [.cursor/rules/UI.md](../.cursor/rules/UI.md) 一致，避免整页大 flex 导致错位。

### 3.2 手动录入卦象

- 与摇卦共用同一 **`cast` 契约**：手动模式最终仍产出相同格式的 6 位结果串，避免后端分叉。  
- **产品**：「摇卦」与「手动录入」建议分 **Tab 或折叠高级区**，降低误触。  
- **远期**：若做离线评估与复盘，可考虑记录 `input_mode`（如随机六步 / 手动），需与后端是否持久化字段一起在 `architecture.md` 约定后再实现。

### 3.3 GitHub 与仓库卫生

- 使用 **[.env.example](../.env.example)** 说明所需变量，真实密钥仅留在本机 `.env.local` 等被 `.gitignore` 忽略的文件中。  
- 小功能、小步 **commit**，便于他人 Review 与回滚。  
- API 路径与字段以 **[architecture.md](../architecture.md)** 为准；`docs/` 内远期文为规划备忘，实现时以契约定稿为准。

---

## 4. 与 `docs` 内两篇远期规划的关系

| 文档 | 主题 | 建议优先级（相对起卦体验之后） |
|------|------|--------------------------------|
| [offline-evaluation-and-algorithm-iteration.md](./offline-evaluation-and-algorithm-iteration.md) | 离线评估、规则版本、影子模式、回归集 | 卦例与规则复杂后再投入 |
| [yongshen-dizhi-grid-and-charting.md](./yongshen-dizhi-grid-and-charting.md) | 用神 144 月支×日支网格、批量接口、热力图 | 用神与结果页稳定后；避免前端 144 次 HTTP |

**建议整体顺序**：先完善 **起卦六次交互 + 手动录卦** 与文档契约 → 再 **144 批量接口与图表** → 再与离线评估文档中的 **版本号、中间量、观测** 衔接。

---

## 5. 里程碑清单（备忘，非排期承诺）

- [ ] **M1 文档与跑通**：`README` 中「本地运行」补充双仓库、启动顺序、链到本文与装机文档（可与本文迭代同步）。  
- [ ] **M2 起卦六次摇**：状态机（逐爻 → 预览 → 排盘）、爻序与 `result` 一致、可选撤销/重摇本爻、页脚文案与行为一致。  
- [ ] **M3 手动录入**：六位选择或合法字符串输入、校验、`cast` 同路径；`PROJECT.md` 用户流程可增一句说明。  
- [ ] **M4 用神 144 与离线评估**：按上节两篇 `docs` 分阶段落地（批量接口、热力图或 12×12 grid、`rule_version` / 回归集等）。

---

## 6. 复盘：写需求与沟通时可怎么用

- 描述起卦时，用 **「需要六次独立操作，每次定一爻」** 比「只摇了一次」更直接对齐开发任务（避免被理解成「随机结果不对」）。  
- 非技术协作者：说明 **目标画面**（例如「能打开 localhost:3000 并完成一次排盘」）和 **操作系统**，比单独说「部署」更易对齐预期。  
- **分工**：逐步装机 → [collaborator-mac-setup.md](./collaborator-mac-setup.md)；分支与合并习惯 → 本文；接口与数据 → [architecture.md](../architecture.md)。

---

*随项目演进更新；若与根目录三份正式文档冲突，以 README / PROJECT / architecture 为准。*
