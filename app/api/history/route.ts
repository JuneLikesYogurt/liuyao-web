import { getBackendBaseUrl } from "@/lib/backend-base-url";
import {
  proxyMalformedUpstreamBody,
  sanitizeUpstreamErrorJson
} from "@/lib/proxy-upstream-error";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const incoming = new URL(req.url);
  const page = incoming.searchParams.get("page") ?? "0";
  const size = incoming.searchParams.get("size") ?? "20";

  const backend = new URL(`${getBackendBaseUrl()}/history`);
  backend.searchParams.set("page", page);
  backend.searchParams.set("size", size);

  const authHeader = req.headers.get("authorization");
  const headers = new Headers();
  if (authHeader) headers.set("Authorization", authHeader);

  const res = await fetch(backend.toString(), { method: "GET", headers });
  const text = await res.text();

  let data: unknown;
  try {
    data = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    return proxyMalformedUpstreamBody(text, "bad_history_response");
  }

  if (!res.ok) {
    return Response.json(
      sanitizeUpstreamErrorJson(res.status, text, "bad_history_response"),
      { status: res.status }
    );
  }

  return Response.json(data, { status: res.status });
}
