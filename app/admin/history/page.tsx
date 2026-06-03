"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { HistoryListView } from "@/components/history/history-list-view";
import { isClientAdmin } from "@/lib/client-user-role";

export default function AdminHistoryPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isClientAdmin()) {
      router.replace("/history");
    }
  }, [router]);

  if (!isClientAdmin()) {
    return (
      <p className="text-sm text-muted-foreground">正在跳转…</p>
    );
  }

  return (
    <HistoryListView
      basePath="/admin/history"
      apiPath="/api/admin/history"
      title="卦例管理"
      description="全站起卦记录；可按用户编号筛选，点击条目可查看卦象详情。"
      loginNext="/admin/history"
      showUserFilter
      showOwnerMeta
    />
  );
}
