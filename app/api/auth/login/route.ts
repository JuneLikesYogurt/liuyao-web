import { getBackendBaseUrl } from "@/lib/backend-base-url";
import {
  proxyMalformedUpstreamBody,
  sanitizeUpstreamErrorJson
} from "@/lib/proxy-upstream-error";

export const runtime = "nodejs";

interface LoginRequestBody {
  identifier?: string;
  password?: string;
}

export async function POST(req: Request) {
  let body: LoginRequestBody;

  try {
    body = (await req.json()) as LoginRequestBody;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const res = await fetch(`${getBackendBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      identifier: body.identifier ?? "",
      password: body.password ?? ""
    })
  });

  const text = await res.text();

  let data: unknown;
  try {
    data = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    return proxyMalformedUpstreamBody(text, "bad_login_response");
  }

  if (!res.ok) {
    return Response.json(
      sanitizeUpstreamErrorJson(res.status, text, "bad_login_response"),
      { status: res.status }
    );
  }

  return Response.json(data, { status: res.status });
}

