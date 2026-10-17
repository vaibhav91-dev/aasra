import { describe, it, expect } from "vitest";
import {
  indiaToday,
  parseAmount,
  sevenDates,
  totals,
  weekSummary,
  validDate,
  type Entry,
} from "../lib/earnings";
import { decodeEntries, saveEntries } from "../lib/storage";
const entry = (overrides: Partial<Entry> = {}): Entry => ({
  id: "one",
  type: "income",
  date: "2026-10-17",
  amountPaise: 10000,
  category: "wages",
  ...overrides,
});
describe("money and reporting", () => {
  it("converts decimal strings exactly and rejects unsafe/invalid values", () => {
    expect(parseAmount("10.09")).toBe(1009);
    for (const v of [
      "0",
      "-1",
      "1.001",
      "NaN",
      "Infinity",
      "1e3",
      " 10",
      "1000000.01",
      "9999999999999999",
      "1.",
    ])
      expect(parseAmount(v)).toBeNull();
    expect(parseAmount("1000000")).toBe(100000000);
  });
  it("calculates income expenses and negative net without AI", () => {
    expect(
      totals([
        entry(),
        entry({
          id: "two",
          type: "expense",
          category: "fuel",
          amountPaise: 15000,
        }),
      ]),
    ).toEqual({
      incomePaise: 10000,
      expensePaise: 15000,
      netPaise: -5000,
      count: 2,
    });
    expect(totals([]).netPaise).toBe(0);
  });
  it("uses India midnight boundaries", () => {
    expect(indiaToday(new Date("2026-10-16T18:29:59Z"))).toBe("2026-10-16");
    expect(indiaToday(new Date("2026-10-16T18:30:00Z"))).toBe("2026-10-17");
  });
  it("includes today and six previous dates, including zero days", () => {
    expect(sevenDates("2026-01-03")[0]).toBe("2025-12-28");
    const s = weekSummary(
      [
        entry(),
        entry({ id: "old", date: "2026-10-10" }),
        entry({ id: "first", date: "2026-10-11" }),
      ],
      "2026-10-17",
    );
    expect(s.count).toBe(2);
    expect(s.days).toHaveLength(7);
    expect(s.days[1].count).toBe(0);
  });
  it("rejects invalid calendar dates", () => {
    expect(validDate("2026-02-30")).toBe(false);
    expect(validDate("2024-02-29")).toBe(true);
  });
});
describe("device persistence", () => {
  it("starts empty and reads only validated entries", () => {
    expect(decodeEntries(null)).toEqual([]);
    expect(
      decodeEntries(JSON.stringify({ version: 1, entries: [entry()] })),
    ).toHaveLength(1);
  });
  it("rejects corrupt, extra sensitive, duplicate and invalid stored data", () => {
    for (const raw of [
      "{",
      "{}",
      JSON.stringify({ version: 1, entries: [entry({ amountPaise: -1 })] }),
      JSON.stringify({
        version: 1,
        entries: [{ ...entry(), name: "private" }],
      }),
      JSON.stringify({ version: 1, entries: [entry(), entry()] }),
    ])
      expect(() => decodeEntries(raw)).toThrow();
  });
  it("does not swallow storage failures", () => {
    expect(() =>
      saveEntries(
        {
          setItem() {
            throw new Error("quota");
          },
        },
        [entry()],
      ),
    ).toThrow("quota");
  });
});
