"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";

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
  showUserFilter?: boolean;
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

function parseUserId(value: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const n = Number.parseInt(trimmed, 10);
  return Number.isFinite(n) && n > 0 ? String(n) : "";
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
  showUserFilter = false,
  showOwnerMeta = false
}: HistoryListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFromUrl = parsePage(searchParams.get("page"));
  const sizeFromUrl = parseSize(searchParams.get("size"));
  const qFromUrl = searchParams.get("q")?.trim() ?? "";
  const userIdFromUrl = showUserFilter ? parseUserId(searchParams.get("userId")) : "";

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

  const replaceUrl = useCallback(
    (next: { page: number; size: number; q: string; userId?: string }) => {
      const qs = new URLSearchParams();
      if (next.page > 0) qs.set("page", String(next.page));
      if (next.size !== DEFAULT_PAGE_SIZE) qs.set("size", String(next.size));
      if (next.q) qs.set("q", next.q);
      const userId = next.userId ?? userIdFromUrl;
      if (showUserFilter && userId) qs.set("userId", userId);
      const query = qs.toString();
      router.replace(query ? `${basePath}?${query}` : basePath);
    },
    [router, basePath, showUserFilter, userIdFromUrl]
  );

  const load = useCallback(
    async (pageIndex: number, pageSize: number, q: string, userId: string) => {
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
        if (showUserFilter && userId) qs.set("userId", userId);

        const res = await fetch(`${apiPath}?${qs.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const raw = await res.text();
        let data: SpringPage & {
          error?: string;
          message?: string;
        } = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          if (!res.ok) {
            throw new Error("服务暂时没有回应，请稍后再试");
          }
          throw new Error("记录数据格式异常，请稍后再试");
        }

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
    [router, apiPath, loginNext, showUserFilter]
  );

  useEffect(() => {
    void load(pageFromUrl, sizeFromUrl, qFromUrl, userIdFromUrl);
  }, [load, queryKey, pageFromUrl, sizeFromUrl, qFromUrl, userIdFromUrl]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    replaceUrl({
      page: 0,
      size: sizeFromUrl,
      q: searchInput.trim(),
      userId: showUserFilter ? parseUserId(userIdInput) : ""
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    replaceUrl({
      page: 0,
      size: sizeFromUrl,
      q: "",
      userId: showUserFilter ? userIdFromUrl : ""
    });
  };

  const handleClearUserFilter = () => {
    setUserIdInput("");
    replaceUrl({
      page: 0,
      size: sizeFromUrl,
      q: qFromUrl,
      userId: ""
    });
  };

  const handleSizeChange = (nextSize: number) => {
    replaceUrl({
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
      replaceUrl({
        page: nextPage,
        size: sizeFromUrl,
        q: qFromUrl,
        userId: userIdFromUrl
      });
    },
    [replaceUrl, sizeFromUrl, qFromUrl, userIdFromUrl, totalPages]
  );

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
      : showUserFilter && userIdFromUrl
        ? `共 ${totalElements} 条（用户 ${userIdFromUrl}）`
        : `共 ${totalElements} 条记录`;

  return (
    <div className="page page--narrow records-page">
      <div className="page-head">
        <div><p className="page-kicker">问卦卷宗</p><h1 className="page-title">{title}</h1><p className="page-subtitle">{description}</p></div>
        <Link className="button" href="/">再起一卦</Link>
      </div>
      <div className="records-toolbar records-toolbar--real">
          <form
            onSubmit={handleSearchSubmit}
            className="records-search"
          >
            <label className="input-icon">
            <span className="sr-only">按标题搜索</span>
            <input className="field"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="按标题搜索"
              aria-label="按标题搜索"
            />
            </label>
            <button className="button button--outline" type="submit" disabled={loading}>搜索</button>
            {qFromUrl ? (
              <button className="button button--ghost"
                type="button"
                disabled={loading}
                onClick={handleClearSearch}
              >
                清除
              </button>
            ) : null}
          </form>

          {showUserFilter && (
            <form
              onSubmit={handleSearchSubmit}
              className="records-search"
            >
              <input className="field"
                type="text"
                inputMode="numeric"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="按用户编号筛选（留空为全站）"
                aria-label="按用户编号筛选"
              />
              <button className="button button--outline" type="submit" disabled={loading}>筛选用户</button>
              {userIdFromUrl ? (
                <button className="button button--ghost"
                  type="button"
                  disabled={loading}
                  onClick={handleClearUserFilter}
                >
                  清除用户
                </button>
              ) : null}
            </form>
          )}

          <div className="records-meta">
            <p>{countLabel}</p>
            <label>
              <span>每页</span>
              <select
                value={sizeFromUrl}
                disabled={loading}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="field records-size"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} 条
                  </option>
                ))}
              </select>
            </label>
          </div>
      </div>

      {error && !loading && <div className="empty-state"><strong>记录暂时无法展开</strong><p>{error}</p></div>}

      {!loading && !error && items.length === 0 && (
            <div className="empty-state"><strong>册中尚无记录</strong><p>
              {qFromUrl ? "没有匹配的历史记录。" : "暂无历史记录。"}
            </p></div>
          )}

      {!loading && items.length > 0 && (
            <section className="records-list" aria-label="排盘记录列表">
              <div className="record-head"><span></span><span>所问与卦象</span><span>起卦时间</span><span>方式</span><span>归属</span><span></span></div>
              {items.map((row, idx) => {
                const id = row.liuyao_id;
                const key =
                  id != null ? String(id) : `row-${idx}-${row.title ?? ""}`;
                const href =
                  id != null
                    ? `/result?liuyao_id=${encodeURIComponent(String(id))}`
                    : undefined;

                const owner = showOwnerMeta
                  ? row.username || (row.user_id != null ? `用户 ${row.user_id}` : "—")
                  : id != null ? `编号 ${id}` : "—";
                const inner = <><span className="record-number">{String(idx + 1).padStart(2, "0")}</span><div className="record-question"><strong>{row.title?.trim() || "（无标题）"}</strong><span>{id != null ? `卦例 · ${id}` : "待补全"}</span></div><span className="record-cell">{row.date ?? "—"}</span><span className="record-cell record-cell--method">六爻排盘</span><span className="record-cell record-cell--status">{owner}</span><span className="record-arrow">→</span></>;

                return href ? (
                  <Link
                    key={key}
                    href={href}
                    className="record-row"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    key={key}
                    className="record-row"
                  >
                    {inner}
                  </div>
                );
              })}
            </section>
          )}

          {showPagination && (
            <div className="records-pagination">
                  <button className="button button--outline"
                    type="button"
                    disabled={loading || pageFromUrl <= 0}
                    onClick={() => goToPage(0)}
                  >
                    首页
                  </button>

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
                      <button className="button button--ghost"
                        key={`page-${item}`}
                        type="button"
                        disabled={loading || item === pageFromUrl}
                        aria-current={item === pageFromUrl ? "page" : undefined}
                        onClick={() => goToPage(item)}
                      >
                        {item + 1}
                      </button>
                    )
                  )}

                  <button className="button button--outline"
                    type="button"
                    disabled={loading || pageFromUrl >= lastPageIndex}
                    onClick={() => goToPage(lastPageIndex)}
                  >
                    尾页
                  </button>
              <p>
                第 {pageFromUrl + 1} / {Math.max(totalPages, 1)} 页
              </p>
            </div>
          )}
    </div>
  );
}

function HistoryListFallback({ title }: { title: string }) {
  return (
    <div className="page page--narrow records-page"><div className="page-head"><div><p className="page-kicker">问卦卷宗</p><h1 className="page-title">{title}</h1><p className="page-subtitle">正在展开册页…</p></div></div></div>
  );
}

export function HistoryListView(props: HistoryListViewProps) {
  return (
    <Suspense fallback={<HistoryListFallback title={props.title} />}>
      <HistoryListViewInner {...props} />
    </Suspense>
  );
}
