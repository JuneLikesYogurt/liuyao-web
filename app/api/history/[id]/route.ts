import { cookies } from "next/headers";

import { getBackendBaseUrl } from "@/lib/backend-base-url";
import { sanitizeUpstreamErrorJson } from "@/lib/proxy-upstream-error";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function authHeaders(req: Request): Promise<Headers> {
  const headers = new Headers({ "content-type": "application/json" });
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    headers.set("Authorization", authHeader);
    return headers;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

function parseLiuyaoId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** 代理后端 `PATCH /history/{liuyaoId}`。 */
export async function PATCH(req: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const liuyaoId = parseLiuyaoId(rawId);
  if (liuyaoId == null) {
    return Response.json({ error: "invalid_id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const url = `${getBackendBaseUrl()}/history/${liuyaoId}`;
  const headers = await authHeaders(req);

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    return Response.json(
      sanitizeUpstreamErrorJson(res.status, text, "rename_history_failed"),
      { status: res.status }
    );
  }

  return new Response(null, { status: 204 });
}
