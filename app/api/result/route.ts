import { getBackendBaseUrl } from "@/lib/backend-base-url";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("liuyao_id");

  if (!id) {
    return Response.json({ error: "missing_liuyao_id" }, { status: 400 });
  }

  const url = `${getBackendBaseUrl()}/result?liuyao_id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) {
    return Response.json(
      { error: "result_failed", status: res.status, body: text },
      { status: 502 }
    );
  }

  // Backend returns JSON; pass through.
  try {
    const data = JSON.parse(text);
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "bad_result_response", body: text },
      { status: 502 }
    );
  }
}

