import { cookies } from "next/headers";

import { getBackendBaseUrl } from "@/lib/backend-base-url";
import {
  proxyMalformedUpstreamBody,
  sanitizeUpstreamErrorJson
} from "@/lib/proxy-upstream-error";

export const runtime = "nodejs";

const FORWARD_PARAMS = ["page", "size", "q", "has_feedback", "userId"] as const;

export async function GET(req: Request) {
  const incoming = new URL(req.url);

  const backend = new URL(`${getBackendBaseUrl()}/admin/history`);
  for (const key of FORWARD_PARAMS) {
    const value = incoming.searchParams.get(key);
    if (value != null && value !== "") {
      backend.searchParams.set(key, value);
    }
  }

  const headers = new Headers();
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    headers.set("Authorization", authHeader);
  } else {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(backend.toString(), { method: "GET", headers });
  const text = await res.text();

  let data: unknown;
  try {
    data = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    return proxyMalformedUpstreamBody(text, "bad_admin_history_response");
  }

  if (!res.ok) {
    return Response.json(
      sanitizeUpstreamErrorJson(res.status, text, "bad_admin_history_response"),
      { status: res.status }
    );
  }

  return Response.json(data, { status: res.status });
}
