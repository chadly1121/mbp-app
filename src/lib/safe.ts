export function safeTs(v: unknown): number | null {
  if (v == null || v === '') return null;
  const d = v instanceof Date ? v : new Date(v as any);
  const t = d.getTime();
  return Number.isNaN(t) ? null : t;
}
export const isList = <T,>(v: unknown): v is T[] => Array.isArray(v);