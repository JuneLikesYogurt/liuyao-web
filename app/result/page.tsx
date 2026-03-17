import Link from "next/link";

import { LiuYao, type LiuYaoLine } from "@/components/liuyao";
import { getLiuYaoDetail, type GuaInfo } from "@/lib/api";
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

function buildBenGuaLines(
  bengua: GuaInfo | null,
  moving: number[]
): LiuYaoLine[] {
  const movingSet = new Set(moving);
  const fallback: LiuYaoLine[] = [1, 1, 1, 1, 1, 1];

  if (!bengua || !bengua.gua_id || bengua.gua_id.length < 6) return fallback;

  const result: LiuYaoLine[] = new Array(6).fill(1);

  for (let yaoPos = 1; yaoPos <= 6; yaoPos++) {
    const ch = bengua.gua_id[yaoPos - 1];
    const isYang = ch === "1";
    const isMoving = movingSet.has(yaoPos);

    let v: LiuYaoLine;
    if (isYang) {
      v = isMoving ? 3 : 1;
    } else {
      v = isMoving ? 0 : 2;
    }

    const idxTopFirst = 6 - yaoPos;
    result[idxTopFirst] = v;
  }

  return result;
}

function buildBianGuaLines(biangua: GuaInfo | null): LiuYaoLine[] {
  const fallback: LiuYaoLine[] = [1, 1, 1, 1, 1, 1];
  if (!biangua || !biangua.gua_id || biangua.gua_id.length < 6) return fallback;

  const result: LiuYaoLine[] = new Array(6).fill(1);

  for (let yaoPos = 1; yaoPos <= 6; yaoPos++) {
    const ch = biangua.gua_id[yaoPos - 1];
    const isYang = ch === "1" || ch === "a";
    const v: LiuYaoLine = isYang ? 1 : 2;
    const idxTopFirst = 6 - yaoPos;
    result[idxTopFirst] = v;
  }

  return result;
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
  const benguaLines = buildBenGuaLines(detail.bengua, moving);
  const hasBianGua = Boolean(detail.biangua);
  const bianguaLines = hasBianGua ? buildBianGuaLines(detail.biangua) : null;

  const yaoLabels = ["一爻", "二爻", "三爻", "四爻", "五爻", "六爻"];
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

          <section className="rounded-lg border bg-muted/40 p-4">
            <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground">本卦</div>
                <div className="text-xs text-foreground">
                  {detail.bengua
                    ? `${detail.bengua.name}（${detail.bengua.guagong}）`
                    : "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground">变卦</div>
                <div className="text-xs text-foreground">
                  {detail.biangua
                    ? `${detail.biangua.name}（${detail.biangua.guagong}）`
                    : "—"}
                </div>
              </div>
            </div>
          </section>

          {detail.bengua && (
            <section className="rounded-lg border bg-muted/40 p-4">
              <LiuYao lines={benguaLines} />
              {hasBianGua && bianguaLines && (
                <div className="mt-4">
                  <LiuYao lines={bianguaLines} />
                </div>
              )}
              <div className="mt-4 grid gap-2 text-xs">
                <div className="grid grid-cols-9 gap-2 text-[11px] text-muted-foreground">
                  <span>六兽</span>
                  <span>本卦六亲</span>
                  <span>本卦地支</span>
                  <span>本卦阴阳</span>
                  <span>世应</span>
                  <span>动爻</span>
                  <span>变卦阴阳</span>
                  <span>变卦六亲</span>
                  <span>变卦地支</span>
                </div>
                {yaoLabels.map((label, index) => {
                  const yaoPos = index + 1;
                  const benguaZhi = detail.bengua?.yao_zhi?.[index] ?? "—";
                  const benguaLiuqin =
                    detail.bengua?.yao_liuqin?.[index] ?? "—";
                  const benguaYY =
                    benguaGuaId[yaoPos - 1] === "1"
                      ? "阳"
                      : benguaGuaId[yaoPos - 1] === "0"
                        ? "阴"
                        : "—";
                  const isShi = detail.bengua?.shi === yaoPos;
                  const isYing = detail.bengua?.ying === yaoPos;
                  const shiYingLabel = isShi
                    ? "世"
                    : isYing
                      ? "应"
                      : "";
                  const isMoving = moving.includes(yaoPos);
                  const bianguaYY =
                    bianguaGuaId[yaoPos - 1] === "1"
                      ? "阳"
                      : bianguaGuaId[yaoPos - 1] === "0"
                        ? "阴"
                        : "—";
                  const bianguaZhi =
                    detail.biangua?.yao_zhi?.[index] ?? "—";
                  const bianguaLiuqin =
                    detail.biangua?.yao_liuqin?.[index] ?? "—";

                  return (
                    <div
                      key={label}
                      className="grid grid-cols-9 items-center gap-2 rounded-md bg-background/70 px-2 py-1.5 sm:px-3"
                    >
                      <span className="text-xs text-amber-700">
                        {detail.bengua_liushou_by_yao?.[index] ?? "—"}
                      </span>
                      <span className="text-xs">{benguaLiuqin}</span>
                      <span className="text-xs">{benguaZhi}</span>
                      <span className="text-xs">{benguaYY}</span>
                      <span className="text-xs">{shiYingLabel}</span>
                      <span className="text-xs">
                        {isMoving ? "●" : ""}
                      </span>
                      <span className="text-xs">{bianguaYY}</span>
                      <span className="text-xs">{bianguaLiuqin}</span>
                      <span className="text-xs">{bianguaZhi}</span>
                    </div>
                  );
                })}
              </div>
            </section>
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
