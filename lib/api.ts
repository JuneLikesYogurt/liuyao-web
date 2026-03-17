const BASE_URL = "http://127.0.0.1:8080";

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
  const res = await fetch("/api/cast", {
    method: "POST",
    headers: {
      "content-type": "application/json"
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

export interface GuaInfo {
  gua_id: string;
  name: string;
  guagong: string;
  shi: number;
  ying: number;
  yao_zhi: string[];
  yao_liuqin: string[];
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
  bengua_liushou_by_yao: string[] | null;
  [key: string]: unknown;
}

export async function getLiuYaoDetail(
  liuyaoId: number | string
): Promise<LiuYaoDetail> {
  const url = `${BASE_URL}/result?liuyao_id=${encodeURIComponent(
    String(liuyaoId)
  )}`;

  const res = await fetch(url, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("结果接口调用失败");
  }

  const data = (await res.json()) as LiuYaoDetail;
  return data;
}

