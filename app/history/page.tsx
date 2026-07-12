"use client";

import { HistoryListView } from "@/components/history/history-list-view";

export default function HistoryPage() {
  return (
    <HistoryListView
      basePath="/history"
      apiPath="/api/history"
      title="我的历史记录"
      description="仅展示您本人保存的起卦记录；可按标题或反馈记录搜索，点击条目可查看卦象详情。"
      loginNext="/history"
    />
  );
}
