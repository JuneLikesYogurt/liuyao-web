"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { HexagramCastPanel, type CastSubmitPayload } from "@/components/cast/hexagram-cast-panel";
import { castLiuYao } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

function HomePage() {
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const router = useRouter();

  const requireAuth = () => {
    if (!window.localStorage.getItem("token")) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const handleSubmit = async ({ result, date }: CastSubmitPayload) => {
    if (!requireAuth() || submitting) return;
    try {
      setSubmitError(null);
      setSubmitting(true);
      const { liuyao_id } = await castLiuYao({
        title: question || "未命名卦例",
        date,
        result
      });
      router.push(`/result?liuyao_id=${encodeURIComponent(liuyao_id)}`);
    } catch (e) {
      console.error(e);
      setSubmitError("排盘失败，请稍后重试");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-6 sm:py-10">
      <Card className="w-full max-w-xl border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
        <CardContent className="space-y-5 pt-6">
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            placeholder="所问"
            aria-label="所问"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 shadow-inner outline-none placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200"
          />

          <HexagramCastPanel
            onRequireAuth={requireAuth}
            onSubmit={handleSubmit}
            onActivity={() => setSubmitError(null)}
            submitting={submitting}
          />

          {submitError ? (
            <p className="text-center text-xs text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
