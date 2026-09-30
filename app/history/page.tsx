"use client";

import { HistoryListView } from "@/components/history/history-list-view";

export default function HistoryPage() {
  return (
    <HistoryListView
      basePath="/history"
      apiPath="/api/history"
      title="我的历史记录"
      description=""
      loginNext="/history"
    />
  );
}
