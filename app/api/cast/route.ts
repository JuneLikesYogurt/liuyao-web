import { getBackendBaseUrl } from "@/lib/backend-base-url";

export const runtime = "nodejs";

function parseIdFromText(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const data = JSON.parse(trimmed) as { liuyao_id?: unknown; id?: unknown };
    const id = Number(data.liuyao_id ?? data.id);
    if (Number.isFinite(id)) return id;
  } catch {
    // ignore
  }

  const id = Number(trimmed);
  return Number.isFinite(id) ? id : null;
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title?: string;
    date?: string;
    result?: string;
  };

  const url = new URL(getBackendBaseUrl());
  url.searchParams.set("title", body.title ?? "");
  url.searchParams.set("date", body.date ?? "");
  url.searchParams.set("result", body.result ?? "");

  // Forward auth header (e.g. `Authorization: Bearer <token>`) to Spring.
  // Frontend should pass it to this Next route; we proxy it to the backend.
  const authHeader = req.headers.get("authorization");
  const headers = new Headers();
  if (authHeader) headers.set("Authorization", authHeader);

  const res = await fetch(url.toString(), { method: "POST", headers });
  const text = await res.text();

  if (!res.ok) {
    return Response.json(
      { error: "cast_failed", status: res.status, body: text },
      { status: 502 }
    );
  }

  const id = parseIdFromText(text);
  if (id == null) {
    return Response.json(
      { error: "bad_cast_response", body: text },
      { status: 502 }
    );
  }

  return Response.json({ liuyao_id: id });
}

