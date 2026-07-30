export const PRICE_FILTER_MIN = 5;
export const PRICE_FILTER_MAX = 100;

export function parsePriceParam(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, PRICE_FILTER_MIN), PRICE_FILTER_MAX);
}
