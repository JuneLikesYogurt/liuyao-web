import { getBackendBaseUrl } from "@/lib/backend-base-url";
import {
  sessionAuthHeaders
} from "@/lib/forward-session-auth";
import {
  proxyMalformedUpstreamBody,
  sanitizeUpstreamErrorJson
} from "@/lib/proxy-upstream-error";

export const runtime = "nodejs";

/** 代理后端 `GET /result/countYongshenGrid`，浏览器经 `/api/result/count-yongshen-grid` 同源调用。 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("liuyao_id");
  const yongshen = searchParams.get("yongshen");

  if (!id || yongshen == null || yongshen === "") {
    return Response.json(
      { error: "missing_liuyao_id_or_yongshen" },
      { status: 400 }
    );
  }

  const url = `${getBackendBaseUrl()}/result/countYongshenGrid?liuyao_id=${encodeURIComponent(
    id
  )}&yongshen=${encodeURIComponent(yongshen)}`;

  const headers = await sessionAuthHeaders(req);
  const res = await fetch(url, { cache: "no-store", headers });
  const text = await res.text();

  if (!res.ok) {
    return Response.json(
      sanitizeUpstreamErrorJson(res.status, text, "count_yongshen_grid_failed"),
      { status: res.status }
    );
  }

  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!isGridBody(payload)) {
    return proxyMalformedUpstreamBody(text, "bad_count_yongshen_grid_response");
  }

  return Response.json(payload);
}

function isGridBody(payload: unknown): payload is {
  values: unknown[];
  month_zhi: string;
  current_day_zhi: string;
} {
  if (!payload || typeof payload !== "object") return false;
  const o = payload as Record<string, unknown>;
  return (
    Array.isArray(o.values) &&
    o.values.length === 144 &&
    typeof o.month_zhi === "string" &&
    typeof o.current_day_zhi === "string"
  );
}
