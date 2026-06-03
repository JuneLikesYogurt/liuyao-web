import { getBackendBaseUrl } from "@/lib/backend-base-url";
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

  const authHeader = req.headers.get("authorization");
  const headers = new Headers({ "content-type": "application/json" });
  if (authHeader) headers.set("Authorization", authHeader);

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
