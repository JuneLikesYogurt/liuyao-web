"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { LiuYao, type LiuYaoLine } from "@/components/liuyao";
import { castLiuYao } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

function HomePage() {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<"idle" | "casting" | "done">("idle");
  const [lines, setLines] = useState<LiuYaoLine[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const requireAuth = () => {
    if (!window.localStorage.getItem("token")) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const generateLines = (): LiuYaoLine[] =>
    Array.from({ length: 6 }, () => Math.floor(Math.random() * 4) as LiuYaoLine);

  const formatDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hour = pad(d.getHours());
    const minute = pad(d.getMinutes());
    const second = pad(d.getSeconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  };

  const handleCast = () => {
    if (!requireAuth()) return;
    if (phase === "casting") return;
    const generated = generateLines();
    setLines(generated);
    setPhase("casting");

    window.setTimeout(() => {
      setPhase("done");
    }, 1200);
  };

  const handlePan = async () => {
    if (!requireAuth()) return;
    if (!lines || lines.length !== 6 || submitting) return;
    try {
      setSubmitting(true);
      // Backend expects 一爻→六爻 (bottom→top). Current lines[0] is top.
      const resultStr = [...lines].reverse().map((v) => String(v)).join("");
      const now = new Date();
      const { liuyao_id } = await castLiuYao({
        title: question || "未命名卦例",
        date: formatDateTime(now),
        result: resultStr
      });
      router.push(`/result?liuyao_id=${encodeURIComponent(liuyao_id)}`);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  const isCasting = phase === "casting";
  const showResult = phase === "done";

  return (
    <div className="flex flex-1 items-center justify-center py-6 sm:py-10">
      <Card className="w-full max-w-xl border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl tracking-wide">起卦</CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                心中默念所问之事，轻按下方按钮静待卦象显现。
              </CardDescription>
            </div>
            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300 text-[11px] text-amber-900 shadow-sm sm:flex">
              六爻
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-2">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-slate-800"
            >
              所问之事（可选）
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="例如：今年事业发展如何？"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 shadow-inner outline-none ring-offset-background placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200"
            />
            <p className="text-xs text-muted-foreground">
              不填也可以，安静片刻，让心念聚焦在你真正关心的方向。
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex justify-center">
              <Button
                size="lg"
                className="min-w-[120px] rounded-full bg-amber-500 text-sm font-medium tracking-[0.25em] text-amber-50 shadow-sm hover:bg-amber-500/90"
                onClick={handleCast}
                disabled={isCasting || submitting}
              >
                起卦
              </Button>
            </div>

            {isCasting && (
              <div className="flex flex-col items-center gap-3 pt-1">
                <div className="flex gap-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300 bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200 shadow-sm"
                    >
                      <div
                        className="h-8 w-8 rounded-full border border-amber-500/80 bg-amber-50/80"
                        style={{
                          animation: `spin 0.8s ease-in-out infinite`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  铜钱转动之间，卦象正在生成……
                </p>
              </div>
            )}

            {showResult && (
              <div className="space-y-3">
                {lines && (
                  <LiuYao
                    lines={lines}
                    className="border-amber-100 bg-amber-50/40"
                  />
                )}
                <div className="flex justify-center pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full px-6 text-xs"
                    onClick={handlePan}
                    disabled={!lines || submitting}
                  >
                    {submitting ? "排盘中…" : "排盘"}
                  </Button>
                </div>
              </div>
            )}
          </section>
        </CardContent>
        <CardFooter className="flex justify-center pt-0 text-[11px] text-muted-foreground">
          当前仅为前端示意交互，真实起卦结果将由后端服务计算。
        </CardFooter>
      </Card>
    </div>
  );
}

export default HomePage;

