import { getBackendBaseUrl } from "@/lib/backend-base-url";
import {
  sessionAuthHeaders
} from "@/lib/forward-session-auth";
import { sanitizeUpstreamErrorJson } from "@/lib/proxy-upstream-error";

export const runtime = "nodejs";

/** 代理后端 `PUT /result/feedback`。 */
export async function PUT(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const url = `${getBackendBaseUrl()}/result/feedback`;

  const headers = await sessionAuthHeaders(req);
  headers.set("content-type", "application/json");
  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    return Response.json(
      sanitizeUpstreamErrorJson(res.status, text, "save_feedback_failed"),
      { status: res.status }
    );
  }

  return new Response(null, { status: 204 });
}
