import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Link from "next/link";

const mockItems = [
  {
    id: "1",
    title: "事业发展",
    createdAt: "2024-03-01 10:21",
    note: "测试数据 · 仅为占位"
  },
  {
    id: "2",
    title: "感情走向",
    createdAt: "2024-03-02 20:15",
    note: "后续可替换为真实数据"
  }
];

function HistoryPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 pt-2 sm:pt-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>历史记录（占位）</CardTitle>
          <CardDescription>
            这里将展示与后端对接后的起卦历史，目前为静态示例数据。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {mockItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-lg border bg-card/60 p-3 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.createdAt}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            未来可以：
            <span className="ml-1">
              支持分页、筛选、按问题类型分类、点击进入详情页等。
            </span>
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <Link
              href="/"
              className="rounded-full border bg-background px-3 py-1.5 text-muted-foreground underline-offset-4 hover:bg-accent hover:text-accent-foreground hover:underline"
            >
              返回起卦
            </Link>
            <Link
              href="/result"
              className="rounded-full border bg-background px-3 py-1.5 text-muted-foreground underline-offset-4 hover:bg-accent hover:text-accent-foreground hover:underline"
            >
              查看示例结果
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoryPage;

