import { dizhiIndex, earthlyBranchFromGanzhi, sliceMonthRow } from "@/lib/dizhi";

export interface CastLiuYaoParams {
  title: string;
  date: string;
  result: string;
}

export interface CastLiuYaoResult {
  liuyao_id: number;
}

export async function castLiuYao(
  params: CastLiuYaoParams
): Promise<CastLiuYaoResult> {
  // Use same-origin proxy to avoid browser CORS issues.
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  const res = await fetch("/api/cast", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    throw new Error("起卦接口调用失败");
  }

  const data = (await res.json()) as CastLiuYaoResult;
  if (!Number.isFinite(data.liuyao_id)) {
    throw new Error("无法解析起卦结果");
  }
  return data;
}

/** 用神计数：同源 `/api/result/count-yongshen` → 后端 `GET /result/countYongshen` */
export async function fetchCountYongshen(params: {
  liuyaoId: string;
  yongshen: number;
}): Promise<number> {
  const { liuyaoId, yongshen } = params;
  if (!Number.isFinite(yongshen) || yongshen < 1 || yongshen > 6) {
    throw new Error("用神爻位无效");
  }

  const q = new URLSearchParams({
    liuyao_id: String(liuyaoId),
    yongshen: String(yongshen)
  });

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  const res = await fetch(`/api/result/count-yongshen?${q.toString()}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const raw = await res.text();
  let payload: unknown;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const fromJson =
      payload &&
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload
        ? String((payload as { error?: unknown }).error ?? "")
        : "";
    const hint = fromJson || raw.trim().slice(0, 120);
    throw new Error(hint || `请求失败（${res.status}）`);
  }

  if (
    payload &&
    typeof payload === "object" &&
    payload !== null &&
    "value" in payload &&
    typeof (payload as { value: unknown }).value === "number"
  ) {
    const v = (payload as { value: number }).value;
    if (Number.isFinite(v)) return v;
  }

  throw new Error("无法解析用神计数结果");
}

export interface CountYongshenDayZhiResult {
  /** 长度 12，`values[0]` = 子（当前月支那一行） */
  values: number[];
  month_zhi: string;
  current_day_zhi: string;
}

export interface CountYongshenGridResult {
  /** 长度 144，`values[0]` = 子月子日，下标 = monthIndex * 12 + dayIndex */
  values: number[];
  month_zhi: string;
  current_day_zhi: string;
}

/** 假数据：月支 × 日支，值落在 [-1, 1]，便于纵轴用 ±1 小刻度。 */
function mockGrid144(): number[] {
  const out: number[] = [];
  for (let m = 0; m < 12; m++) {
    for (let d = 0; d < 12; d++) {
      const v = Math.sin((m + 1) * 0.45 + (d + 1) * 0.52) * 0.85;
      out.push(Math.round(v * 1000) / 1000);
    }
  }
  return out;
}

/**
 * 144 月支×日支用神计数。本轮不打 HTTP，延迟后返回假网格；
 * 本卦月日交叉格写成当前 `countValue`，便于对照反馈区计数。
 * 后端就绪后改为 `GET /api/result/count-yongshen-grid`。
 */
export async function fetchCountYongshenGrid(params: {
  liuyaoId: string;
  yongshen: number;
  countValue: number;
  month?: string | null;
  day?: string | null;
  xunkong?: string | null;
}): Promise<CountYongshenGridResult> {
  const { yongshen, countValue, month, day } = params;
  if (!Number.isFinite(yongshen) || yongshen < 1 || yongshen > 6) {
    throw new Error("用神爻位无效");
  }

  void params.liuyaoId;
  void params.xunkong;

  await new Promise((resolve) => setTimeout(resolve, 320));

  const month_zhi = earthlyBranchFromGanzhi(month) ?? "";
  const current_day_zhi = earthlyBranchFromGanzhi(day) ?? "";
  const values = mockGrid144();
  const monthIdx = dizhiIndex(month_zhi);
  const dayIdx = dizhiIndex(current_day_zhi);
  if (monthIdx >= 0 && dayIdx >= 0 && Number.isFinite(countValue)) {
    values[monthIdx * 12 + dayIdx] = countValue;
  }

  return { values, month_zhi, current_day_zhi };
}

/** 当前月支对应的 12 日支，由 144 切片。后端就绪后可改为专用 GET。 */
export async function fetchCountYongshenDayZhi(params: {
  liuyaoId: string;
  yongshen: number;
  countValue: number;
  month?: string | null;
  day?: string | null;
  xunkong?: string | null;
}): Promise<CountYongshenDayZhiResult> {
  const grid = await fetchCountYongshenGrid(params);
  const monthIdx = dizhiIndex(grid.month_zhi);
  const values =
    monthIdx >= 0 ? sliceMonthRow(grid.values, monthIdx) : grid.values.slice(0, 12);
  return {
    values,
    month_zhi: grid.month_zhi,
    current_day_zhi: grid.current_day_zhi
  };
}

export interface YongshenRecord {
  yongshen: number;
  count_value: number;
  feedback_correct: boolean | null;
  feedback_time?: string | null;
}

/** 保存反馈：全量提交 feedback_correct + comment */
export async function saveResultFeedback(params: {
  liuyaoId: string;
  yongshen: number;
  feedback_correct: boolean | null;
  comment: string;
}): Promise<void> {
  const { liuyaoId, yongshen, feedback_correct, comment } = params;
  if (!Number.isFinite(yongshen) || yongshen < 0 || yongshen > 6) {
    throw new Error("用神爻位无效");
  }

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  const res = await fetch("/api/result/feedback", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      liuyao_id: Number(liuyaoId),
      yongshen,
      feedback_correct,
      comment: comment ?? ""
    })
  });

  if (!res.ok) {
    const raw = await res.text();
    let hint = raw.trim().slice(0, 120);
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed !== null &&
        "error" in parsed
      ) {
        hint = String((parsed as { error?: unknown }).error ?? hint);
      }
    } catch {
      // keep raw hint
    }
    throw new Error(hint || `保存失败（${res.status}）`);
  }
}

/** 重命名卦例：同源 `/api/history/[id]` → 后端 `PATCH /history/{id}` */
export async function renameHistoryItem(params: {
  liuyaoId: number;
  title: string;
}): Promise<void> {
  const { liuyaoId, title } = params;
  if (!Number.isFinite(liuyaoId) || liuyaoId <= 0) {
    throw new Error("卦例编号无效");
  }
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("标题不能为空");
  }

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  const res = await fetch(`/api/history/${liuyaoId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ title: trimmed })
  });

  if (!res.ok) {
    const raw = await res.text();
    let hint = raw.trim().slice(0, 120);
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed !== null &&
        "error" in parsed
      ) {
        hint = String((parsed as { error?: unknown }).error ?? hint);
      }
    } catch {
      // keep raw hint
    }
    if (res.status === 403) {
      throw new Error("无权重命名该卦例");
    }
    if (res.status === 404) {
      throw new Error("卦例不存在");
    }
    throw new Error(hint || `重命名失败（${res.status}）`);
  }
}

/** 删除卦例：同源 `/api/history/[id]` → 后端 `DELETE /history/{id}` */
export async function deleteHistoryItem(params: {
  liuyaoId: number;
}): Promise<void> {
  const { liuyaoId } = params;
  if (!Number.isFinite(liuyaoId) || liuyaoId <= 0) {
    throw new Error("卦例编号无效");
  }

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  const res = await fetch(`/api/history/${liuyaoId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!res.ok) {
    const raw = await res.text();
    let hint = raw.trim().slice(0, 120);
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed !== null &&
        "error" in parsed
      ) {
        hint = String((parsed as { error?: unknown }).error ?? hint);
      }
    } catch {
      // keep raw hint
    }
    if (res.status === 403) {
      throw new Error("无权删除该卦例");
    }
    if (res.status === 404) {
      throw new Error("卦例不存在");
    }
    throw new Error(hint || `删除失败（${res.status}）`);
  }
}

/** 单卦信息。`gua_id` 为自上而下（[0]=上爻，[5]=初爻）；`yao_zhi`/`yao_liuqin` 与 UI 中 `index` 一致（[0]=初爻，[5]=上爻），与 `gua_id` 字符顺序相反，前端对 `gua_id` 单独用下标 `5-index` 对齐。 */
export interface GuaInfo {
  /** 六位阴阳串：索引 0 = 上爻，索引 5 = 初爻 */
  gua_id: string;
  name: string;
  guagong: string;
  shi: number;
  ying: number;
  /** 六位地支，与 `index` 一致：索引 0 = 初爻，5 = 上爻 */
  yao_zhi: string[];
  /** 六位六亲，与 `index` 一致：索引 0 = 初爻，5 = 上爻 */
  yao_liuqin: string[];
  /** 六位天干，与 `yao_zhi` 同序；`yao1_gan` 为初爻即索引 0 */
  yao_gan?: string[];
  /** 伏神地支，与 `yao_zhi` 同序；无伏神可为空串或缺省 */
  yao_zhi_fu?: string[];
  /** 伏神六亲，与 `yao_liuqin` 同序 */
  yao_liuqin_fu?: string[];
}

export interface LiuYaoDetail {
  liuyao_id: number;
  title: string | null;
  date: string | null;
  year: string | null;
  month: string | null;
  day: string | null;
  hour: string | null;
  xunkong: string | null;
  mingdong: string | null;
  andong: string | null;
  bengua: GuaInfo | null;
  biangua: GuaInfo | null;
  /** 六兽等，与 `index` 一致：索引 0 = 初爻，5 = 上爻 */
  bengua_liushou_by_yao: string[] | null;
  /** 整卦反馈记录（全卦一份） */
  comment?: string | null;
  /** 各爻用神计算与应验反馈 */
  yongshen_records?: YongshenRecord[] | null;
  [key: string]: unknown;
}
