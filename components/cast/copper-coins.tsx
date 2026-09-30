"use client";

import { useEffect, useRef, useState } from "react";

import {
  RESTING_COIN_FACES,
  nextCoinRotation,
  type ThreeCoinFaces
} from "@/lib/liuyao-cast";
import { cn } from "@/lib/utils";

/** 三枚错开落地；面板写爻时刻与最慢一枚对齐 */
export const COIN_FLIP_DURATIONS_MS = [900, 1050, 1200] as const;
export const COIN_FLIP_MAX_MS = COIN_FLIP_DURATIONS_MS[2];

const EXTRA_TURNS = [4, 5, 6] as const;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function StoneFace({ tone }: { tone: "yin" | "yang" }) {
  return (
    <div
      className={cn(
        "h-full w-full rounded-full",
        tone === "yang"
          ? "border border-stone-300 bg-stone-100 shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(28,25,23,0.08)]"
          : "border border-slate-900 bg-slate-800 shadow-[inset_0_2px_3px_rgba(255,255,255,0.14),inset_0_-3px_5px_rgba(0,0,0,0.45)]"
      )}
    />
  );
}

function CastStone({
  rotation,
  durationMs,
  instant
}: {
  rotation: number;
  durationMs: number;
  instant: boolean;
}) {
  return (
    <div className="copper-scene h-14 w-14">
      <div
        className="copper-coin-inner"
        style={{
          transform: `rotateY(${rotation}deg)`,
          transitionDuration: instant ? "0ms" : `${durationMs}ms`
        }}
      >
        <div className="copper-coin-face copper-coin-bei">
          <StoneFace tone="yang" />
        </div>
        <div className="copper-coin-face copper-coin-zi">
          <StoneFace tone="yin" />
        </div>
      </div>
    </div>
  );
}

export function CopperCoins({
  faces,
  spinId
}: {
  faces: ThreeCoinFaces;
  spinId: number;
}) {
  const [rotations, setRotations] = useState([0, 0, 0]);
  const [instant, setInstant] = useState(true);
  const rotationsRef = useRef([0, 0, 0]);
  const appliedSpinIdRef = useRef(0);

  useEffect(() => {
    if (spinId === 0) {
      appliedSpinIdRef.current = 0;
      setInstant(true);
      rotationsRef.current = [0, 0, 0];
      setRotations([0, 0, 0]);
      return;
    }

    if (appliedSpinIdRef.current === spinId) return;
    appliedSpinIdRef.current = spinId;

    const reduced = prefersReducedMotion();
    const extras = reduced ? [0, 0, 0] : EXTRA_TURNS;
    const next = faces.map((face, i) =>
      nextCoinRotation(rotationsRef.current[i] ?? 0, face, extras[i] ?? 0)
    );
    rotationsRef.current = next;
    setInstant(reduced);
    setRotations(next);
  }, [faces, spinId]);

  const labels = faces.map((f) => (f === 0 ? "阴" : "阳")).join("、");

  return (
    <div
      className={cn("grid min-h-16 grid-flow-col justify-center gap-4 py-2")}
      aria-label={`三子 ${spinId === 0 ? "未摇" : labels}`}
    >
      {(spinId === 0 ? RESTING_COIN_FACES : faces).map((face, i) => (
        <div key={i} data-coin-face={face === 0 ? "yin" : "yang"}>
          <CastStone
            rotation={rotations[i] ?? 0}
            durationMs={COIN_FLIP_DURATIONS_MS[i] ?? COIN_FLIP_MAX_MS}
            instant={instant}
          />
        </div>
      ))}
    </div>
  );
}
