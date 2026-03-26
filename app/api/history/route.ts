import { getBackendBaseUrl } from "@/lib/backend-base-url";

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

  try {
    const data = JSON.parse(text) as unknown;
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      {
        error: "bad_history_response",
        status: res.status,
        body: text
      },
      { status: 502 }
    );
  }
}
