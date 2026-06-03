"use client";

import { HistoryListView } from "@/components/history/history-list-view";

export default function HistoryPage() {
  return (
    <HistoryListView
      basePath="/history"
      apiPath="/api/history"
      title="我的历史记录"
      description="仅展示您本人保存的起卦记录；点击条目可查看卦象详情。"
      loginNext="/history"
    />
  );
}
