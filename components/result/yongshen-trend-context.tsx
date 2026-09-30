"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type YongshenTrendSelection = {
  /** 已确认并完成计算的爻位；未点选时为 null */
  yao: number | null;
  countValue: number | null;
  calcLoading: boolean;
};

const EMPTY_SELECTION: YongshenTrendSelection = {
  yao: null,
  countValue: null,
  calcLoading: false
};

type YongshenTrendContextValue = {
  selection: YongshenTrendSelection;
  setSelection: (next: YongshenTrendSelection) => void;
};

const YongshenTrendContext = createContext<YongshenTrendContextValue | null>(
  null
);

export function YongshenTrendProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] =
    useState<YongshenTrendSelection>(EMPTY_SELECTION);

  const setSelection = useCallback((next: YongshenTrendSelection) => {
    setSelectionState((prev) =>
      prev.yao === next.yao &&
      prev.countValue === next.countValue &&
      prev.calcLoading === next.calcLoading
        ? prev
        : next
    );
  }, []);

  const value = useMemo(
    () => ({ selection, setSelection }),
    [selection, setSelection]
  );

  return (
    <YongshenTrendContext.Provider value={value}>
      {children}
    </YongshenTrendContext.Provider>
  );
}

export function useYongshenTrendSelection(): YongshenTrendContextValue {
  const ctx = useContext(YongshenTrendContext);
  if (!ctx) {
    throw new Error("useYongshenTrendSelection 需要 YongshenTrendProvider");
  }
  return ctx;
}
