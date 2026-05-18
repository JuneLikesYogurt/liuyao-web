const MAX_SAFE_STRING = 200;
const DEV_SNIPPET_LEN = 300;

const SAFE_JSON_KEYS = new Set(["error", "message"]);

function pickSafeStringKeys(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of SAFE_JSON_KEYS) {
    const v = obj[key];
    if (typeof v !== "string") continue;
    out[key] =
      v.length > MAX_SAFE_STRING ? `${v.slice(0, MAX_SAFE_STRING)}…` : v;
  }
  return out;
}

function statusFallbackPayload(
  upstreamStatus: number,
  fallbackError: string
): Record<string, unknown> {
  if (upstreamStatus === 401) return { error: "Unauthorized" };
  if (upstreamStatus === 403) return { error: "forbidden" };
  return { error: fallbackError };
}

function appendDevDebugSnippet(
  out: Record<string, unknown>,
  rawText: string
): Record<string, unknown> {
  if (process.env.NODE_ENV !== "development") return out;
  const t = rawText.trim();
  if (!t) return out;
  out.debugSnippet =
    t.length > DEV_SNIPPET_LEN ? `${t.slice(0, DEV_SNIPPET_LEN)}…` : t;
  return out;
}

/**
 * 将 Spring 等非 2xx 或无法解析的响应体转为可给浏览器的安全 JSON（生产不附带原文）。
 * 仅保留 `error` / `message` 字符串字段；若无可用字段则按 HTTP 状态回退语义。
 */
export function sanitizeUpstreamErrorJson(
  upstreamStatus: number,
  rawText: string,
  fallbackError: string
): Record<string, unknown> {
  const trimmed = rawText.trim();
  let parsed: unknown;
  if (trimmed) {
    try {
      parsed = JSON.parse(trimmed) as unknown;
    } catch {
      parsed = undefined;
    }
  }

  let out: Record<string, unknown>;
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    out = pickSafeStringKeys(parsed as Record<string, unknown>);
  } else {
    out = {};
  }

  if (Object.keys(out).length === 0) {
    out = statusFallbackPayload(upstreamStatus, fallbackError);
  }

  return appendDevDebugSnippet(out, rawText);
}

/** 上游 2xx 但正文非预期 JSON 时，502 + 固定 error，生产不带原文。 */
export function proxyMalformedUpstreamBody(
  rawText: string,
  errorCode: string
): Response {
  const out: Record<string, unknown> = { error: errorCode };
  appendDevDebugSnippet(out, rawText);
  return Response.json(out, { status: 502 });
}
