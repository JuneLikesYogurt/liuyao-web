import Link from "next/link";

import { getLiuYaoDetail } from "@/lib/get-liuyao-detail";
import { BenGuaDetailContent } from "@/components/result/ben-gua-detail";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface ResultPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function parseMoving(mingdong: string | null | undefined): number[] {
  if (!mingdong) return [];
  return mingdong
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 6);
}

async function ResultPage({ searchParams }: ResultPageProps) {
  const sp = await searchParams;
  const idParam = sp.liuyao_id;
  const liuyaoId = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!liuyaoId) {
    return (
      <div className="flex flex-1 items-start justify-center pt-4 sm:pt-8">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>卦象结果</CardTitle>
            <CardDescription>请从起卦页面开始排盘。</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <Link
              href="/"
              className="rounded-full border bg-background px-3 py-1.5 text-muted-foreground underline-offset-4 hover:bg-accent hover:text-accent-foreground hover:underline"
            >
              返回起卦
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const detail = await getLiuYaoDetail(liuyaoId);
  const moving = parseMoving(detail.mingdong);
  const benguaGuaId = detail.bengua?.gua_id ?? "";
  const bianguaGuaId = detail.biangua?.gua_id ?? "";

  return (
    <div className="flex flex-1 items-start justify-center pt-4 sm:pt-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {detail.title || "起卦"}
          </CardTitle>
          <CardDescription className="text-xs">
            {detail.date ?? "—"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <section className="rounded-lg border bg-muted/40 p-4">
            <div className="grid grid-cols-5 gap-3 text-center text-xs">
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground">年</div>
                <div className="text-xs text-foreground">
                  {detail.year ?? "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground">月</div>
                <div className="text-xs text-foreground">
                  {detail.month ?? "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground">日</div>
                <div className="text-xs text-foreground">
                  {detail.day ?? "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground">时</div>
                <div className="text-xs text-foreground">
                  {detail.hour ?? "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground">旬空</div>
                <div className="text-xs text-foreground">
                  {detail.xunkong ?? "—"}
                </div>
              </div>
            </div>
          </section>

          {detail.bengua && (
            <BenGuaDetailContent
              liuyaoId={String(liuyaoId)}
              detail={detail}
              moving={moving}
              benguaGuaId={benguaGuaId}
              bianguaGuaId={bianguaGuaId}
            />
          )}

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <Link
              href="/"
              className="rounded-full border bg-background px-3 py-1.5 text-muted-foreground underline-offset-4 hover:bg-accent hover:text-accent-foreground hover:underline"
            >
              返回起卦
            </Link>
            <Link
              href="/history"
              className="rounded-full border bg-background px-3 py-1.5 text-muted-foreground underline-offset-4 hover:bg-accent hover:text-accent-foreground hover:underline"
            >
              历史记录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResultPage;
