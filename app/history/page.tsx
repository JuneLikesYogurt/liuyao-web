"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

interface HistoryRow {
  liuyao_id?: number;
  title?: string;
  date?: string;
}

interface SpringPage {
  content?: HistoryRow[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
}

function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryRow[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (pageIndex: number) => {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("token")
          : null;

      if (!token) {
        setLoading(false);
        router.push("/login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const qs = new URLSearchParams({
          page: String(pageIndex),
          size: String(PAGE_SIZE)
        });
        const res = await fetch(`/api/history?${qs.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = (await res.json()) as SpringPage & {
          error?: string;
          message?: string;
        };

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(
            data.message || data.error || `加载失败 (${res.status})`
          );
        }

        setItems(Array.isArray(data.content) ? data.content : []);
        setTotalPages(
          typeof data.totalPages === "number" && data.totalPages >= 0
            ? data.totalPages
            : 0
        );
        setPage(pageIndex);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void load(0);
  }, [load]);

  return (
    <div className="flex flex-1 flex-col gap-4 pt-2 sm:pt-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>历史记录</CardTitle>
          <CardDescription>
            登录后展示您在服务端保存的起卦记录；点击条目可查看卦象详情。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground">加载中…</p>
          )}

          {error && !loading && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-muted-foreground">暂无历史记录。</p>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {items.map((row, idx) => {
                const id = row.liuyao_id;
                const key =
                  id != null ? String(id) : `row-${idx}-${row.title ?? ""}`;
                const href =
                  id != null
                    ? `/result?liuyao_id=${encodeURIComponent(String(id))}`
                    : undefined;

                const inner = (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {row.title?.trim() || "（无标题）"}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {row.date ?? "—"}
                      </span>
                    </div>
                    {id != null && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        编号 {id}
                      </p>
                    )}
                  </>
                );

                return href ? (
                  <Link
                    key={key}
                    href={href}
                    className="flex flex-col rounded-lg border bg-card/60 p-3 transition-colors hover:bg-accent/40"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    key={key}
                    className="flex flex-col rounded-lg border bg-card/60 p-3"
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page <= 0}
                onClick={() => void load(page - 1)}
              >
                上一页
              </Button>
              <span className="text-xs text-muted-foreground">
                第 {page + 1} / {totalPages} 页
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page >= totalPages - 1}
                onClick={() => void load(page + 1)}
              >
                下一页
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <Link
              href="/"
              className="rounded-full border bg-background px-3 py-1.5 text-muted-foreground underline-offset-4 hover:bg-accent hover:text-accent-foreground hover:underline"
            >
              返回起卦
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoryPage;
