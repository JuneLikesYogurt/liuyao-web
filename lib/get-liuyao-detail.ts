import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import type { LiuYaoDetail } from "@/lib/api";

/** Fetches detail via same-origin `/api/result` proxy (aligned with `app/api/result/route.ts`). */
export async function getLiuYaoDetail(
  liuyaoId: number | string
): Promise<LiuYaoDetail> {
  const h = await headers();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/result?liuyao_id=${encodeURIComponent(
    String(liuyaoId)
  )}`;

  const reqHeaders: HeadersInit = {};
  if (token) {
    reqHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    cache: "no-store",
    headers: reqHeaders
  });

  if (res.status === 401) {
    redirect(
      `/login?next=${encodeURIComponent(`/result?liuyao_id=${String(liuyaoId)}`)}`
    );
  }

  if (res.status === 403) {
    throw new Error("无权查看该记录");
  }

  if (!res.ok) {
    throw new Error("结果接口调用失败");
  }

  const data = (await res.json()) as LiuYaoDetail;
  return data;
}
