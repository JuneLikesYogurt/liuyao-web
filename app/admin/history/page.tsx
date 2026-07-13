import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { HistoryListView } from "@/components/history/history-list-view";
import {
  isAdminSession,
  TOKEN_COOKIE,
  USER_ROLE_COOKIE
} from "@/lib/auth-cookie";

export default async function AdminHistoryPage() {
  const cookieStore = await cookies();
  const isAdmin = isAdminSession(
    cookieStore.get(TOKEN_COOKIE)?.value,
    cookieStore.get(USER_ROLE_COOKIE)?.value
  );

  if (!isAdmin) {
    redirect("/history");
  }

  return (
    <HistoryListView
      basePath="/admin/history"
      apiPath="/api/admin/history"
      title="卦例管理"
      description=""
      // description="全站起卦记录；可按标题或反馈记录搜索，点击条目可查看卦象详情。"
      loginNext="/admin/history"
      showOwnerMeta
    />
  );
}
