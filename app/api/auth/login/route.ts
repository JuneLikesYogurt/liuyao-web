import { getBackendBaseUrl } from "@/lib/backend-base-url";

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

  try {
    const data = JSON.parse(text) as unknown;
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      {
        error: "bad_login_response",
        status: res.status,
        body: text
      },
      { status: 502 }
    );
  }
}

