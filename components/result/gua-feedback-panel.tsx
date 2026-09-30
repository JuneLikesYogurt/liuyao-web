"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

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
  const showYongshenSection = yongshen != null;

  return (
    <FeedbackSlot>
    <section className="detail-section real-feedback" id="feedback">
      <div className="detail-section__head">
        <div>
          <p className="page-kicker">回看留记</p>
          <h2 className="section-title">本卦反馈</h2>
        </div>
      </div>

      <div className="real-feedback__body">
        <div className="field-wrap">
          <label
            htmlFor="gua-feedback-comment"
            className="field-label"
          >
            反馈记录
          </label>
          <textarea
            id="gua-feedback-comment"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            rows={4}
            className="field real-feedback__textarea"
            placeholder="选填：记录本卦复盘、问题等（全卦一份）"
          />
        </div>

        {showYongshenSection && (
          <div className="real-feedback__yongshen">
            <div>
              <p className="real-feedback__current">
                当前用神：{yaoWeiLabel(yongshen)} · {liuqin ?? "—"}
              </p>
              <div className="real-feedback__count">
                <span>
                  计数：
                  {calcLoading ? (
                    "计算中…"
                  ) : calcError ? (
                    <span className="auth-message--error">{calcError}</span>
                  ) : countValue != null ? (
                    <strong>
                      {countValue}
                    </strong>
                  ) : (
                    "—"
                  )}
                </span>
                <button className="button button--outline real-feedback__small"
                  type="button"
                  disabled={calcLoading}
                  onClick={onRecalculate}
                >
                  重新计算
                </button>
              </div>
            </div>

            <div>
              <p className="field-label">是否应验</p>
              <div className="feedback-choices">
                <button className="choice"
                  type="button"
                  aria-pressed={feedbackCorrect === true}
                  onClick={() => onFeedbackCorrectChange(true)}
                >
                  是
                </button>
                <button className="choice"
                  type="button"
                  aria-pressed={feedbackCorrect === false}
                  onClick={() => onFeedbackCorrectChange(false)}
                >
                  否
                </button>
                <button className="button button--ghost real-feedback__small"
                  type="button"
                  disabled={feedbackCorrect === null}
                  onClick={() => onFeedbackCorrectChange(null)}
                >
                  清除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="real-feedback__foot">
        {saveError && (
          <p className="auth-message auth-message--error">{saveError}</p>
        )}
        <button className="button button--ink"
          type="button"
          disabled={saving || calcLoading}
          onClick={() => void onSave()}
        >
          {saving ? "保存中…" : "保存反馈"}
        </button>
      </div>
    </section>
    </FeedbackSlot>
  );
}

function FeedbackSlot({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setSlot(document.getElementById("yongshen-feedback-slot"));
  }, []);

  if (!slot) return null;
  return createPortal(children, slot);
}
