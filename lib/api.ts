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

  const res = await fetch(`/api/result/count-yongshen?${q.toString()}`, {
    method: "GET"
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
  [key: string]: unknown;
}
