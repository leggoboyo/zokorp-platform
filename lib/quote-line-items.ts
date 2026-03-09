import { z } from "zod";

export const quoteLineItemSchema = z.object({
  code: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(140),
  amountLow: z.number().int().min(0),
  amountHigh: z.number().int().min(0),
  reason: z.string().trim().min(1).max(220),
});
export type QuoteLineItem = z.infer<typeof quoteLineItemSchema>;

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsdRange(low: number, high: number) {
  return `${formatUsd(low)} - ${formatUsd(high)}`;
}

export function quoteLineItemText(item: QuoteLineItem) {
  return `${item.label}: ${formatUsdRange(item.amountLow, item.amountHigh)}. ${item.reason}`;
}

export function renderQuoteLineItemsHtml(items: QuoteLineItem[]) {
  return items
    .map((item) => `<li>${escapeHtml(quoteLineItemText(item))}</li>`)
    .join("");
}

export function sumQuoteLineItems(items: QuoteLineItem[]) {
  return items.reduce(
    (totals, item) => ({
      low: totals.low + item.amountLow,
      high: totals.high + item.amountHigh,
    }),
    { low: 0, high: 0 },
  );
}

export function uniqueQuoteLineItems<T extends QuoteLineItem>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.code.trim().toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function scaleQuoteLineItems<T extends QuoteLineItem>(
  items: T[],
  targetLow: number,
  targetHigh: number,
): T[] {
  if (items.length === 0) {
    return items;
  }

  const scaledLow = scaleField(items, "amountLow", targetLow);
  const scaledHigh = scaleField(items, "amountHigh", targetHigh);

  return items.map((item, index) => ({
    ...item,
    amountLow: scaledLow[index] ?? 0,
    amountHigh: Math.max(scaledHigh[index] ?? 0, scaledLow[index] ?? 0),
  }));
}

function scaleField<T extends QuoteLineItem>(
  items: T[],
  field: "amountLow" | "amountHigh",
  target: number,
) {
  if (target <= 0) {
    return items.map(() => 0);
  }

  const total = items.reduce((sum, item) => sum + item[field], 0);
  if (total <= 0) {
    return items.map((_, index) => (index === 0 ? target : 0));
  }

  const rawShares = items.map((item) => (item[field] / total) * target);
  const base = rawShares.map((value) => Math.floor(value));
  let remainder = target - base.reduce((sum, value) => sum + value, 0);

  const ranked = rawShares
    .map((value, index) => ({
      index,
      fraction: value - base[index],
      original: items[index]?.[field] ?? 0,
    }))
    .sort((left, right) => {
      if (right.fraction !== left.fraction) {
        return right.fraction - left.fraction;
      }

      if (right.original !== left.original) {
        return right.original - left.original;
      }

      return left.index - right.index;
    });

  let cursor = 0;
  while (remainder > 0) {
    const next = ranked[cursor % ranked.length];
    if (!next) {
      break;
    }

    base[next.index] += 1;
    remainder -= 1;
    cursor += 1;
  }

  return base;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
