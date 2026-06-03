"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { yaoWeiLabel } from "@/lib/yao-wei";

export function GuaFeedbackPanel({
  yongshen,
  liuqin,
  countValue,
  calcLoading,
  calcError,
  feedbackCorrect,
  comment,
  saving,
  saveError,
  onFeedbackCorrectChange,
  onCommentChange,
  onRecalculate,
  onSave
}: {
  yongshen: number | null;
  liuqin?: string;
  countValue: number | null;
  calcLoading: boolean;
  calcError: string | null;
  feedbackCorrect: boolean | null;
  comment: string;
  saving?: boolean;
  saveError?: string | null;
  onFeedbackCorrectChange: (value: boolean | null) => void;
  onCommentChange: (value: string) => void;
  onRecalculate: () => void;
  onSave: () => void | Promise<void>;
}) {
  const verdictBtnClass = (active: boolean) =>
    active
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "bg-background";

  const showYongshenSection = yongshen != null;

  return (
    <Card className="border-dashed shadow-none">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">本卦反馈</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-0">
        <div className="space-y-1">
          <label
            htmlFor="gua-feedback-comment"
            className="text-[11px] text-muted-foreground"
          >
            反馈记录
          </label>
          <textarea
            id="gua-feedback-comment"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-xs leading-relaxed ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="选填：记录本卦复盘、问题等（全卦一份）"
          />
        </div>

        {showYongshenSection && (
          <div className="space-y-3 border-t pt-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">
                当前用神：{yaoWeiLabel(yongshen)} · {liuqin ?? "—"}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>
                  计数：
                  {calcLoading ? (
                    "计算中…"
                  ) : calcError ? (
                    <span className="text-destructive">{calcError}</span>
                  ) : countValue != null ? (
                    <span className="tabular-nums text-foreground">
                      {countValue}
                    </span>
                  ) : (
                    "—"
                  )}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={calcLoading}
                  onClick={onRecalculate}
                >
                  重新计算
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground">是否应验</p>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`h-8 text-xs ${verdictBtnClass(feedbackCorrect === true)}`}
                  onClick={() => onFeedbackCorrectChange(true)}
                >
                  是
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`h-8 text-xs ${verdictBtnClass(feedbackCorrect === false)}`}
                  onClick={() => onFeedbackCorrectChange(false)}
                >
                  否
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  disabled={feedbackCorrect === null}
                  onClick={() => onFeedbackCorrectChange(null)}
                >
                  清除
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-2 p-4 pt-0">
        {saveError && (
          <p className="text-xs text-destructive">{saveError}</p>
        )}
        <Button
          type="button"
          size="sm"
          className="w-full sm:w-auto sm:self-end"
          disabled={saving || calcLoading}
          onClick={() => void onSave()}
        >
          {saving ? "保存中…" : "保存反馈"}
        </Button>
      </CardFooter>
    </Card>
  );
}
