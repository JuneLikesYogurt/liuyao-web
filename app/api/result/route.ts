import { getBackendBaseUrl } from "@/lib/backend-base-url";
import {
  proxyMalformedUpstreamBody,
  sanitizeUpstreamErrorJson
} from "@/lib/proxy-upstream-error";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("liuyao_id");

  if (!id) {
    return Response.json({ error: "missing_liuyao_id" }, { status: 400 });
  }

  const url = `${getBackendBaseUrl()}/result?liuyao_id=${encodeURIComponent(id)}`;

  const authHeader = req.headers.get("authorization");
  const headers = new Headers();
  if (authHeader) headers.set("Authorization", authHeader);

  const res = await fetch(url, { cache: "no-store", headers });
  const text = await res.text();

  if (!res.ok) {
    return Response.json(
      sanitizeUpstreamErrorJson(res.status, text, "result_failed"),
      { status: res.status }
    );
  }

  // Backend returns JSON; pass through.
  try {
    const data = JSON.parse(text);
    return Response.json(data);
  } catch {
    return proxyMalformedUpstreamBody(text, "bad_result_response");
  }
}

