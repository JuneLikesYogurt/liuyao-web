"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getClientAuthToken } from "@/lib/client-auth-token";
import { isClientAdmin } from "@/lib/client-user-role";

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

interface HistoryRow {
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

function parseUserId(value: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const n = Number.parseInt(trimmed, 10);
  return Number.isFinite(n) && n > 0 ? String(n) : "";
}

/** 页码条：0-based 页索引；页数多时用省略号压缩中间段。 */
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

function HistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = isClientAdmin();

  const pageFromUrl = parsePage(searchParams.get("page"));
  const sizeFromUrl = parseSize(searchParams.get("size"));
  const qFromUrl = searchParams.get("q")?.trim() ?? "";
  const userIdFromUrl = parseUserId(searchParams.get("userId"));

  const [items, setItems] = useState<HistoryRow[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(qFromUrl);
  const [userIdInput, setUserIdInput] = useState(userIdFromUrl);

  const queryKey = useMemo(
    () => `${pageFromUrl}|${sizeFromUrl}|${qFromUrl}|${userIdFromUrl}`,
    [pageFromUrl, sizeFromUrl, qFromUrl, userIdFromUrl]
  );

  useEffect(() => {
    setSearchInput(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => {
    setUserIdInput(userIdFromUrl);
  }, [userIdFromUrl]);

  const replaceHistoryUrl = useCallback(
    (next: { page: number; size: number; q: string; userId?: string }) => {
      const qs = new URLSearchParams();
      if (next.page > 0) qs.set("page", String(next.page));
      if (next.size !== DEFAULT_PAGE_SIZE) qs.set("size", String(next.size));
      if (next.q) qs.set("q", next.q);
      const userId = next.userId ?? userIdFromUrl;
      if (isAdmin && userId) qs.set("userId", userId);
      const query = qs.toString();
      router.replace(query ? `/history?${query}` : "/history");
    },
    [router, isAdmin, userIdFromUrl]
  );

  const load = useCallback(
    async (pageIndex: number, pageSize: number, q: string, userId: string) => {
      const token = getClientAuthToken();

      if (!token) {
        setLoading(false);
        router.push("/login?next=/history");
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
        if (isAdmin && userId) qs.set("userId", userId);

        const res = await fetch(`/api/history?${qs.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = (await res.json()) as SpringPage & {
          error?: string;
          message?: string;
        };

        if (res.status === 401) {
          router.push("/login?next=/history");
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
    [router, isAdmin]
  );

  useEffect(() => {
    void load(pageFromUrl, sizeFromUrl, qFromUrl, userIdFromUrl);
  }, [load, queryKey, pageFromUrl, sizeFromUrl, qFromUrl, userIdFromUrl]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    replaceHistoryUrl({
      page: 0,
      size: sizeFromUrl,
      q: searchInput.trim(),
      userId: isAdmin ? parseUserId(userIdInput) : ""
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    replaceHistoryUrl({
      page: 0,
      size: sizeFromUrl,
      q: "",
      userId: isAdmin ? userIdFromUrl : ""
    });
  };

  const handleClearUserFilter = () => {
    setUserIdInput("");
    replaceHistoryUrl({
      page: 0,
      size: sizeFromUrl,
      q: qFromUrl,
      userId: ""
    });
  };

  const handleSizeChange = (nextSize: number) => {
    replaceHistoryUrl({
      page: 0,
      size: nextSize,
      q: qFromUrl,
      userId: userIdFromUrl
    });
  };

  const goToPage = useCallback(
    (pageIndex: number) => {
      const lastPage = Math.max(totalPages - 1, 0);
      const nextPage = Math.min(Math.max(pageIndex, 0), lastPage);
      replaceHistoryUrl({
        page: nextPage,
        size: sizeFromUrl,
        q: qFromUrl,
        userId: userIdFromUrl
      });
    },
    [replaceHistoryUrl, sizeFromUrl, qFromUrl, userIdFromUrl, totalPages]
  );

  const pageJumpItems = useMemo(
    () => buildPageJumpItems(pageFromUrl, totalPages),
    [pageFromUrl, totalPages]
  );

  const showPagination = totalPages > 1 || pageFromUrl > 0;
  const lastPageIndex = Math.max(totalPages - 1, 0);

  return (
    <div className="flex flex-1 flex-col gap-4 pt-2 sm:pt-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>历史记录</CardTitle>
          <CardDescription>
            {isAdmin
              ? "管理员视图：可浏览全站起卦记录，并按用户编号筛选。"
              : "登录后展示您在服务端保存的起卦记录；点击条目可查看卦象详情。"}
          </CardDescription>
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
              placeholder="按标题搜索"
              aria-label="按标题搜索"
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

          {isAdmin && (
            <form
              onSubmit={handleSearchSubmit}
              className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"
            >
              <input
                type="text"
                inputMode="numeric"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="按用户编号筛选（留空为全站）"
                aria-label="按用户编号筛选"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200"
              />
              <Button type="submit" variant="outline" size="sm" disabled={loading}>
                筛选用户
              </Button>
              {userIdFromUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={handleClearUserFilter}
                >
                  清除用户
                </Button>
              ) : (
                <span aria-hidden="true" className="hidden sm:block" />
              )}
            </form>
          )}

          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-center">
            <p>
              {loading
                ? "加载中…"
                : qFromUrl
                  ? `共 ${totalElements} 条匹配「${qFromUrl}」`
                  : isAdmin && userIdFromUrl
                    ? `共 ${totalElements} 条（用户 ${userIdFromUrl}）`
                    : `共 ${totalElements} 条记录`}
            </p>
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
                        {row.username ? ` · ${row.username}` : null}
                        {row.user_id != null && !row.username
                          ? ` · 用户 ${row.user_id}`
                          : null}
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

export default HistoryPage;
