import { headers } from "next/headers";

import type { LiuYaoDetail } from "@/lib/api";

/** Fetches detail via same-origin `/api/result` proxy (aligned with `app/api/result/route.ts`). */
export async function getLiuYaoDetail(
  liuyaoId: number | string
): Promise<LiuYaoDetail> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/result?liuyao_id=${encodeURIComponent(
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
