---
name: result 爻位天干显示
overview: 纯增量：后端 DTO/JSON 增加 yao_gan[]（yao1=初爻）；前端 GuaInfo/行数据/UI 仅追加天干展示（地支右侧、浅色）。仓库布局为 liuyao-web 与 liuyao_back 同层。不改旧字段语义与既有展示逻辑。
todos:
  - id: backend-dto-add-only
    content: liuyao_back：Gua/DTO 仅新增 yao_gan 数组字段；装配处 yao_gan[i]=yao(i+1)_gan（i=0 初爻）；不删不改现有 yao_zhi 等
    status: pending
  - id: backend-result-json
    content: GET /result 嵌套 bengua/biangua 多出 yao_gan；无则 null/省略由前端兜底
    status: pending
  - id: fe-additive
    content: lib/api GuaInfo 与 GuaYaoRow 增加可选 gan/yao_gan；buildGuaYaoRows 仅多赋一行，不动原 liuqin/dizhi/yang
    status: pending
  - id: fe-ui-muted
    content: gua-module 地支右侧追加天干 span，muted 色；布局微调仅限本组
    status: pending
  - id: docs-arch
    content: architecture.md 增补 yao_gan 与 yao1_gan=初爻 一句
    status: pending
isProject: false
---

# Result 页爻位天干显示（修订）

## 原则：最小化、纯增量

- **只增加** 天干相关字段与展示，**不**改现有 `yao_zhi`、`yao_liuqin`、`gua_id`、六亲/地支/阴阳的既有含义与代码路径（除非必须接新字段的一行赋值）。
- 旧客户端若忽略未知 JSON 字段，行为不变；前端对新字段做 **可选链 / 默认「—」**。

## 仓库位置

- 前端：`liuyao-web`
- 后端：`liuyao_back`（与 `liuyao-web` **同级目录**，路径未变仅位置说明）

---

## 已确认：库表爻位编号

- `**yao1_gan` = 初爻**，…，`**yao6_gan` = 上爻**（与 `yao_zhi` 常见编号一致）。
- 与前端 `**index`** 对齐：`**yao_gan[0] = yao1_gan`**，…，`**yao_gan[5] = yao6_gan`**，与 `**yao_zhi[index]**` 同序，**无需反转**。

---

## 后端（liuyao_back）

1. **实体 / Mapper**：若 `Gua` 读 `gua_allchange` 尚未映射 `yao1_gan`～`yao6_gan`，**仅增加列映射**，不动其它列。
2. **DTO**（如 `GuaDetailDto` / 详情里本卦变卦结构）：**新增** `yao_gan`（`List<String>` 或 `String[]`，长度 6）。**不要**重命名或改动现有字段。
3. **装配**：在已有填充 `yao_zhi` 的逻辑旁，**追加** 一行循环或六次赋值：`yao_gan.set(i, entity.getYao(i+1)Gan())` 等价形式；本卦，变卦各来自对应 `Gua` 行。
4. **接口**：仍 `**GET /result?liuyao_id=`**，响应 JSON **多字段**；无干数据时字段可 `null` 或空数组，前端兜底。

---

## 前端（liuyao-web）

1. `**lib/api.ts`**：`GuaInfo` **增加** `yao_gan?: string[]`（或后端驼峰名 + 类型对齐）。
2. `**GuaYaoRow`**：**增加** `gan: string`（展示用，默认「—」）。
3. `**buildGuaYaoRows`**：在 return 对象里 **多写** `gan: gua?.yao_gan?.[index] ?? "—"`，**不修改** `liuqin`、`dizhi`、`yang` 的计算。
4. `**gua-module.tsx`**：在 `dizhi` 右侧增加天干 `<span>`，`**text-muted-foreground`**（或 `opacity` 略低）；**不调整** `YaoLine` 列。
5. **变卦**：对 `detail.biangua` 同样读 `yao_gan`。

---

## 文档

- `**architecture.md`**：在 GuaInfo / 数据模型处 **追加** `yao_gan` 与「`yao1_gan` 为初爻、与 `yao_zhi` 同下标」一句即可。

---

## 验收

- 有数据时：每行 **地支右、浅灰** 显示天干，与库一致。
- 无数据或旧响应：仍只显示原排盘，无报错。
- 阴阳爻视觉仍为主，天干不抢焦点。

