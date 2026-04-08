/** 爻位 1–6 → 传统称谓（初爻=1，上爻=6） */
export function yaoWeiLabel(yaoPos: number): string {
  const labels = ["", "初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
  if (yaoPos >= 1 && yaoPos <= 6) return labels[yaoPos] ?? "—";
  return "—";
}
