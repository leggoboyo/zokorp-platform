import { describe, expect, it } from "vitest";

import { scaleQuoteLineItems, sumQuoteLineItems, uniqueQuoteLineItems } from "@/lib/quote-line-items";

describe("quote line items", () => {
  it("scales quote items to the requested totals without losing ordering", () => {
    const scaled = scaleQuoteLineItems(
      [
        {
          code: "base",
          label: "Base scope",
          amountLow: 100,
          amountHigh: 150,
          reason: "Base",
        },
        {
          code: "data",
          label: "Data cleanup",
          amountLow: 50,
          amountHigh: 100,
          reason: "Data",
        },
      ],
      450,
      700,
    );

    expect(sumQuoteLineItems(scaled)).toEqual({ low: 450, high: 700 });
    expect(scaled[0]!.amountLow).toBeGreaterThan(scaled[1]!.amountLow);
    expect(scaled[0]!.amountHigh).toBeGreaterThan(scaled[1]!.amountHigh);
  });

  it("deduplicates line items by stable code", () => {
    const unique = uniqueQuoteLineItems([
      {
        code: "base",
        label: "Base scope",
        amountLow: 100,
        amountHigh: 150,
        reason: "Base",
      },
      {
        code: "BASE",
        label: "Duplicate base scope",
        amountLow: 90,
        amountHigh: 140,
        reason: "Duplicate",
      },
    ]);

    expect(unique).toHaveLength(1);
    expect(unique[0]!.label).toBe("Base scope");
  });
});
