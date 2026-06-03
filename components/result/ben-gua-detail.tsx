import { BenGuaYongShenClient } from "@/components/result/ben-gua-yongshen-client";
import type { GuaInfo, LiuYaoDetail } from "@/lib/api";
import type { GuaYaoRow } from "@/components/result/gua-module";

function fushenDisplayText(gua: GuaInfo | null, index: number): string | undefined {
  if (!gua) return undefined;
  const lq = (gua.yao_liuqin_fu?.[index] ?? "").replace(/\r/g, "").trim();
  const zh = (gua.yao_zhi_fu?.[index] ?? "").replace(/\r/g, "").trim();
  if (!lq && !zh) return undefined;
  const body = [lq, zh].filter(Boolean).join(" ");
  return `伏 ${body}`;
}

function buildGuaYaoRows(
  gua: GuaInfo | null,
  guaId: string,
  kind: "ben" | "bian"
): GuaYaoRow[] {
  return Array.from({ length: 6 }, (_, i) => {
    const index = 5 - i;
    const yaoPos = index + 1;
    // 后端 gua_id 自上而下 [0]=上爻；六亲/地支等数组仍用 index（自下而上编号），仅 gua_id 用 5-index 对齐
    const yy = guaId[5 - index];
    const isYang =
      kind === "ben" ? yy === "1" : yy === "1" || yy === "a";
    const dizhi = gua?.yao_zhi?.[index] ?? "—";
    const gan = (gua?.yao_gan?.[index] ?? "—").replace(/\r/g, "");
    const liuqin = (gua?.yao_liuqin?.[index] ?? "—").replace(/\r/g, "");
    const isShi = gua?.shi === yaoPos;
    const isYing = gua?.ying === yaoPos;
    const shiYing: "" | "世" | "应" = isShi
      ? "世"
      : isYing
        ? "应"
        : "";
    const fushen = fushenDisplayText(gua, index);
    return { liuqin, dizhi, gan, yang: isYang, shiYing, yaoPos, fushen };
  });
}

function buildLiushouLabels(detail: LiuYaoDetail): string[] {
  return Array.from({ length: 6 }, (_, i) => {
    const index = 5 - i;
    return detail.bengua_liushou_by_yao?.[index] ?? "—";
  });
}

export function BenGuaDetailContent({
  liuyaoId,
  detail,
  moving,
  benguaGuaId,
  bianguaGuaId
}: {
  liuyaoId: string;
  detail: LiuYaoDetail;
  moving: number[];
  benguaGuaId: string;
  bianguaGuaId: string;
}) {
  const hasBian = Boolean(detail.biangua);
  const movingSet = new Set(moving);

  const liushouLabels = buildLiushouLabels(detail);
  const benLines = buildGuaYaoRows(detail.bengua, benguaGuaId, "ben");
  const bianLines = hasBian
    ? buildGuaYaoRows(detail.biangua, bianguaGuaId, "bian")
    : [];

  const movingRows = Array.from({ length: 6 }, (_, i) => {
    const index = 5 - i;
    const yaoPos = index + 1;
    const benguaYY = benguaGuaId[5 - index];
    const benguaIsYang = benguaYY === "1";
    return {
      isMoving: movingSet.has(yaoPos),
      benguaIsYang,
      showArrow: hasBian
    };
  });

  return (
    <BenGuaYongShenClient
      liuyaoId={liuyaoId}
      initialComment={detail.comment}
      initialYongshenRecords={detail.yongshen_records}
      liushouLabels={liushouLabels}
      benLines={benLines}
      bianLines={bianLines}
      hasBian={hasBian}
      movingRows={movingRows}
      benName={detail.bengua?.name ?? "—"}
      bianName={detail.biangua?.name ?? "—"}
    />
  );
}
