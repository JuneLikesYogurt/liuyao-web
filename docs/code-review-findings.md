# Code review 对照清单（liuyao-web / liuyao_back）

> 来源：安全与架构 review。按严重度排序，改完一条可把状态改为「已处理」并补一行备注（PR / commit）。

| 严重度 | 主题 | 说明与位置 | 状态 |
|--------|------|------------|------|
| 高 | 仓库内明文敏感配置 | 敏感项仅 `ENC(...)`；主口令 **`JASYPT_ENCRYPTOR_PASSWORD` 仅环境变量**。Git 历史若曾含明文仍建议在库外轮换。 | **已处理**：统一 Jasypt；见 `liuyao_back/architecture.md` 与 README |
| 高 | 调试接口暴露 | `GET /result/test` 匿名可调用并执行 `preCount`。`LiuYaoResultController` | **已处理**：已删除该映射 |
| 高 | Actuator 全开放 | `SecurityConfig` 中 `/actuator/**` `permitAll` + `pom` 引入 actuator，生产可能暴露管理端点。 | 未处理 |
| 高 / 产品 | 排盘详情 IDOR | `GET /result?liuyao_id=` 无需登录即可读任意记录（含 `title` 等）。与「仅本人可见」假设可能冲突。 | 未处理：需产品决策后改鉴权或改文档 |
| 中 | Middleware JWT 仅验 exp | `liuyao-web/middleware.ts` 不解签，仅解析 payload。**非安全边界**，仅影响是否重定向到登录页。 | 未处理：建议在 architecture 或代码注释中写明 |
| 中 | 代理错误体回传 | `app/api/cast/route.ts`、`count-yongshen/route.ts` 等将后端 `body` 原文返回给浏览器，可能泄露栈/SQL。 | 未处理 |
| 中 | 起卦接口打日志 | `YaoGuaController` `System.out.println(title, result, …)`，日志长期留存用户所问。 | 未处理 |
| 低 | architecture 附录路径 | 附录写 `getLiuYaoDetail` → `GET /result`，实现为同源 `/api/result`。 | 未处理 |
| 低 | 起卦 body 表述 | 文档「非 JSON body」与 Next 路由「读 JSON 再拼 query」易误读。 | 未处理 |
| 低 | Controller 职责 | `LiuYaoResultController` 内 DTO 映射偏多，可抽 Mapper（非紧急）。 | 未处理 |
| 低 | 注释掉的 import | `LiuYaoResultController` 顶部注释 import。 | 未处理（可与上条一并整理） |
| 低 | 安全相关自动化测试 | `/result` 鉴权、`/result/test` 不存在、代理错误体等。 | 未处理 |

## 环境变量（后端）

- **`JASYPT_ENCRYPTOR_PASSWORD`**：解密 `application.yml` 中所有 `ENC(...)`。开发/生产机制相同，**主口令与 ENC 取值分环境**（见 `liuyao_back/README.md`）。

## 修订记录

| 日期 | 变更 |
|------|------|
| 2026-05-13 | 初稿；关闭 `/result/test`；`application.yml` 改为环境变量 |
| 2026-05-13 | 为 DATASOURCE_* / JWT_SECRET 增加本机开发默认值，避免未 export 时占位符无法解析导致启动失败 |
| 2026-05-13 | 后端引入 Jasypt（`jasypt-spring-boot-starter` 3.0.5）、测试用 `jasypt.encryptor.password`、`.gitignore` 增加 `application-local.yml`；对照表与环境变量小节同步 |
| 2026-05-13 | 开发与生产统一为 ENC + `JASYPT_ENCRYPTOR_PASSWORD`；移除 `application-local` 与 README 双路径；精简 findings |
| 2026-05-14 | 明文敏感配置标为已处理；`liuyao_back` 新增独立 `architecture.md`，后端文档与前端分离 |
