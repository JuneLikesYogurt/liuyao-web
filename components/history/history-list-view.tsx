"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteHistoryItem } from "@/lib/api";
import { getClientAuthToken } from "@/lib/client-auth-token";

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export interface HistoryRow {
  liuyao_id?: number;
  title?: string;
  date?: string;
  user_id?: number;
  username?: string;
}

interface SpringPage {
  content?: HistoryRow[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
}

export interface HistoryListViewProps {
  basePath: string;
  apiPath: string;
  title: string;
  description: string;
  loginNext: string;
  showOwnerMeta?: boolean;
}

function parsePage(value: string | null): number {
  const n = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseSize(value: string | null): number {
  const n = Number.parseInt(value ?? String(DEFAULT_PAGE_SIZE), 10);
  if (!Number.isFinite(n)) return DEFAULT_PAGE_SIZE;
  return PAGE_SIZE_OPTIONS.includes(n as (typeof PAGE_SIZE_OPTIONS)[number])
    ? n
    : DEFAULT_PAGE_SIZE;
}

function buildPageJumpItems(
  currentPage: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const items: Array<number | "ellipsis"> = [0];

  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages - 2, currentPage + 2);

  if (currentPage <= 3) {
    start = 1;
    end = 4;
  } else if (currentPage >= totalPages - 4) {
    start = totalPages - 5;
    end = totalPages - 2;
  }

  if (start > 1) {
    items.push("ellipsis");
  } else {
    for (let i = 1; i < start; i++) items.push(i);
  }

  for (let i = start; i <= end; i++) items.push(i);

  if (end < totalPages - 2) {
    items.push("ellipsis");
  } else {
    for (let i = end + 1; i < totalPages - 1; i++) items.push(i);
  }

  items.push(totalPages - 1);
  return items;
}

function HistoryListViewInner({
  basePath,
  apiPath,
  title,
  description,
  loginNext,
  showOwnerMeta = false
}: HistoryListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFromUrl = parsePage(searchParams.get("page"));
  const sizeFromUrl = parseSize(searchParams.get("size"));
  const qFromUrl = searchParams.get("q")?.trim() ?? "";

  const [items, setItems] = useState<HistoryRow[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(qFromUrl);
  const [actionBusyId, setActionBusyId] = useState<number | null>(null);

  const queryKey = useMemo(
    () => `${pageFromUrl}|${sizeFromUrl}|${qFromUrl}`,
    [pageFromUrl, sizeFromUrl, qFromUrl]
  );

  useEffect(() => {
    setSearchInput(qFromUrl);
  }, [qFromUrl]);

  const replaceUrl = useCallback(
    (next: { page: number; size: number; q: string }) => {
      const qs = new URLSearchParams();
      if (next.page > 0) qs.set("page", String(next.page));
      if (next.size !== DEFAULT_PAGE_SIZE) qs.set("size", String(next.size));
      if (next.q) qs.set("q", next.q);
      const query = qs.toString();
      router.replace(query ? `${basePath}?${query}` : basePath);
    },
    [router, basePath]
  );

  const load = useCallback(
    async (pageIndex: number, pageSize: number, q: string) => {
      const token = getClientAuthToken();

      if (!token) {
        setLoading(false);
        router.push(`/login?next=${encodeURIComponent(loginNext)}`);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const qs = new URLSearchParams({
          page: String(pageIndex),
          size: String(pageSize)
        });
        if (q) qs.set("q", q);

        const res = await fetch(`${apiPath}?${qs.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = (await res.json()) as SpringPage & {
          error?: string;
          message?: string;
        };

        if (res.status === 401) {
          router.push(`/login?next=${encodeURIComponent(loginNext)}`);
          return;
        }

        if (res.status === 403) {
          throw new Error("无权访问该页面");
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
        setTotalElements(
          typeof data.totalElements === "number" && data.totalElements >= 0
            ? data.totalElements
            : 0
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
        setItems([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    },
    [router, apiPath, loginNext]
  );

  useEffect(() => {
    void load(pageFromUrl, sizeFromUrl, qFromUrl);
  }, [load, queryKey, pageFromUrl, sizeFromUrl, qFromUrl]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    replaceUrl({
      page: 0,
      size: sizeFromUrl,
      q: searchInput.trim()
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    replaceUrl({
      page: 0,
      size: sizeFromUrl,
      q: ""
    });
  };

  const handleSizeChange = (nextSize: number) => {
    replaceUrl({
      page: 0,
      size: nextSize,
      q: qFromUrl
    });
  };

  const goToPage = useCallback(
    (pageIndex: number) => {
      const lastPage = Math.max(totalPages - 1, 0);
      const nextPage = Math.min(Math.max(pageIndex, 0), lastPage);
      replaceUrl({
        page: nextPage,
        size: sizeFromUrl,
        q: qFromUrl
      });
    },
    [replaceUrl, sizeFromUrl, qFromUrl, totalPages]
  );

  const handleDelete = async (row: HistoryRow) => {
    const id = row.liuyao_id;
    if (id == null || actionBusyId != null) return;

    const label = row.title?.trim() || `编号 ${id}`;
    const ok = window.confirm(`确定删除卦例「${label}」？删除后不可恢复。`);
    if (!ok) return;

    setActionBusyId(id);
    setError(null);
    try {
      await deleteHistoryItem({ liuyaoId: id });
      const remainingOnPage = items.length - 1;
      if (remainingOnPage <= 0 && pageFromUrl > 0) {
        replaceUrl({
          page: pageFromUrl - 1,
          size: sizeFromUrl,
          q: qFromUrl
        });
      } else {
        await load(pageFromUrl, sizeFromUrl, qFromUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    } finally {
      setActionBusyId(null);
    }
  };

  const pageJumpItems = useMemo(
    () => buildPageJumpItems(pageFromUrl, totalPages),
    [pageFromUrl, totalPages]
  );

  const showPagination = totalPages > 1 || pageFromUrl > 0;
  const lastPageIndex = Math.max(totalPages - 1, 0);

  const countLabel = loading
    ? "加载中…"
    : qFromUrl
      ? `共 ${totalElements} 条匹配「${qFromUrl}」`
      : `共 ${totalElements} 条记录`;

  return (
    <div className="flex flex-1 flex-col gap-4 pt-2 sm:pt-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={handleSearchSubmit}
            className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="按标题或反馈记录搜索"
              aria-label="按标题或反馈记录搜索"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200"
            />
            <Button type="submit" variant="outline" size="sm" disabled={loading}>
              搜索
            </Button>
            {qFromUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={handleClearSearch}
              >
                清除
              </Button>
            ) : (
              <span aria-hidden="true" className="hidden sm:block" />
            )}
          </form>

          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-center">
            <p>{countLabel}</p>
            <label className="grid grid-cols-[auto_1fr] items-center gap-2 sm:justify-items-end">
              <span>每页</span>
              <select
                value={sizeFromUrl}
                disabled={loading}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="rounded-md border border-slate-200 bg-background px-2 py-1 text-xs text-slate-900 outline-none focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} 条
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && !loading && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {qFromUrl ? "没有匹配的历史记录。" : "暂无历史记录。"}
            </p>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {items.map((row, idx) => {
                const id = row.liuyao_id;
                const key =
                  id != null ? String(id) : `row-${idx}-${row.title ?? ""}`;
                const href =
                  id != null
                    ? `/result?liuyao_id=${encodeURIComponent(String(id))}`
                    : undefined;
                const busy = id != null && actionBusyId === id;

                return (
                  <div
                    key={key}
                    className="flex flex-col rounded-lg border bg-card/60 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {href ? (
                          <Link
                            href={href}
                            className="block truncate text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
                          >
                            {row.title?.trim() || "（无标题）"}
                          </Link>
                        ) : (
                          <span className="block truncate text-sm font-medium">
                            {row.title?.trim() || "（无标题）"}
                          </span>
                        )}
                        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                          {row.date ?? "—"}
                          {showOwnerMeta && row.username
                            ? ` · ${row.username}`
                            : null}
                          {showOwnerMeta &&
                          row.user_id != null &&
                          !row.username
                            ? ` · 用户 ${row.user_id}`
                            : null}
                        </p>
                      </div>
                      {id != null && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 shrink-0 px-2 text-xs"
                          disabled={loading || actionBusyId != null}
                          onClick={() => void handleDelete(row)}
                        >
                          {busy ? "删除中…" : "删除"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showPagination && (
            <div className="grid gap-2 pt-1">
              <div className="overflow-x-auto">
                <div className="grid w-max auto-cols-max grid-flow-col items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading || pageFromUrl <= 0}
                    onClick={() => goToPage(0)}
                  >
                    首页
                  </Button>

                  {pageJumpItems.map((item, idx) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-xs text-muted-foreground"
                        aria-hidden="true"
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={`page-${item}`}
                        type="button"
                        variant={item === pageFromUrl ? "default" : "outline"}
                        size="sm"
                        className="min-w-8 px-2"
                        disabled={loading || item === pageFromUrl}
                        aria-current={item === pageFromUrl ? "page" : undefined}
                        onClick={() => goToPage(item)}
                      >
                        {item + 1}
                      </Button>
                    )
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading || pageFromUrl >= lastPageIndex}
                    onClick={() => goToPage(lastPageIndex)}
                  >
                    尾页
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                第 {pageFromUrl + 1} / {Math.max(totalPages, 1)} 页
              </p>
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

function HistoryListFallback({ title }: { title: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <Card className="border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>加载中…</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export function HistoryListView(props: HistoryListViewProps) {
  return (
    <Suspense fallback={<HistoryListFallback title={props.title} />}>
      <HistoryListViewInner {...props} />
    </Suspense>
  );
}
