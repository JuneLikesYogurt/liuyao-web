import { getBackendBaseUrl } from "@/lib/backend-base-url";
import {
  proxyMalformedUpstreamBody,
  sanitizeUpstreamErrorJson
} from "@/lib/proxy-upstream-error";

export const runtime = "nodejs";

/** 代理后端 `GET /result/countYongshen`，浏览器经 `/api/result/count-yongshen` 同源调用。 */
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

  const url = `${getBackendBaseUrl()}/result/countYongshen?liuyao_id=${encodeURIComponent(
    id
  )}&yongshen=${encodeURIComponent(yongshen)}`;

  const authHeader = req.headers.get("authorization");
  const headers = new Headers();
  if (authHeader) headers.set("Authorization", authHeader);

  const res = await fetch(url, { cache: "no-store", headers });
  const text = await res.text();

  if (!res.ok) {
    return Response.json(
      sanitizeUpstreamErrorJson(res.status, text, "count_yongshen_failed"),
      { status: res.status }
    );
  }

  const value = parseCountYongshenBody(text);
  if (value === null) {
    return proxyMalformedUpstreamBody(text, "bad_count_yongshen_response");
  }

  return Response.json({ value });
}

function parseCountYongshenBody(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (typeof parsed === "number" && Number.isFinite(parsed)) return parsed;
    if (
      parsed &&
      typeof parsed === "object" &&
      "value" in parsed &&
      typeof (parsed as { value: unknown }).value === "number"
    ) {
      const v = (parsed as { value: number }).value;
      return Number.isFinite(v) ? v : null;
    }
  } catch {
    // 非 JSON：按纯数字解析（如后端直接返回文本）
  }

  const n = Number.parseFloat(trimmed);
  return Number.isFinite(n) ? n : null;
}
