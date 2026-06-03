"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  HexagramCastPanel,
  type CastSubmitPayload
} from "@/components/cast/hexagram-cast-panel";
import { castLiuYao } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

function HomePage() {
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      setSubmitting(true);
      const { liuyao_id } = await castLiuYao({
        title: question || "未命名卦例",
        date,
        result
      });
      router.push(`/result?liuyao_id=${encodeURIComponent(liuyao_id)}`);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-6 sm:py-10">
      <Card className="w-full max-w-xl border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl tracking-wide">起卦</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            placeholder="所问（可选）"
            aria-label="所问"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 shadow-inner outline-none placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200"
          />

          <HexagramCastPanel
            onRequireAuth={requireAuth}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
