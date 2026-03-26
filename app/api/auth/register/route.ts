import { getBackendBaseUrl } from "@/lib/backend-base-url";

export const runtime = "nodejs";

interface RegisterRequestBody {
  username?: string;
  password?: string;
}

export async function POST(req: Request) {
  let body: RegisterRequestBody;

  try {
    body = (await req.json()) as RegisterRequestBody;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const res = await fetch(`${getBackendBaseUrl()}/auth/register`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      username: body.username ?? "",
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
        error: "bad_register_response",
        status: res.status,
        body: text
      },
      { status: 502 }
    );
  }
}
