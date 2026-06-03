/** 与 cast API / 历史列表一致的起卦时间字符串 */
export function formatCastDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** `<input type="datetime-local" />` 取值 */
export function dateToDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseCastDateTime(s: string): Date | null {
  const m = s.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
  );
  if (!m) return null;
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6])
  );
  return Number.isNaN(d.getTime()) ? null : d;
}

/** datetime-local → `YYYY-MM-DD HH:mm:00` */
export function datetimeLocalToCastString(value: string): string | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:00`;
}

export function isCastDateTimeString(s: string): boolean {
  return parseCastDateTime(s) !== null;
}

/** 可解析且不过晚于当前时刻（容差 1 分钟） */
export function isValidManualCastDatetimeLocal(value: string): boolean {
  const castStr = datetimeLocalToCastString(value);
  if (!castStr) return false;
  const d = parseCastDateTime(castStr);
  if (!d) return false;
  return d.getTime() <= Date.now() + 60_000;
}
