import { cookies } from "next/headers";

/**
 * 结果页接口优先用登录 cookie。
 * 浏览器 localStorage 里的旧 token 会让上游直接 401，即使 cookie 仍然有效。
 */
export async function sessionAuthHeaders(req: Request): Promise<Headers> {
  const headers = new Headers();
  const token = (await cookies()).get("token")?.value?.trim();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader) headers.set("Authorization", authHeader);
  return headers;
}
