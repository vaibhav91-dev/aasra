import { locales, type Language, type Strings } from "./i18n";
export const categories = {
  income: ["delivery", "wages", "tips", "otherIncome"],
  expense: ["fuel", "food", "maintenance", "travel", "otherExpense"],
} as const;
export type EntryType = keyof typeof categories;
export type Category = (typeof categories)[EntryType][number];
export type Entry = {
  id: string;
  type: EntryType;
  amountPaise: number;
  date: string;
  category: Category;
};
export const MAX_AMOUNT = 100_000_000; // ₹10 lakh per entry, at most 10,000 entries.
export const MAX_ENTRIES = 10_000;
export function parseAmount(value: string): number | null {
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(value)) return null;
  const [rupees, fraction = ""] = value.split(".");
  const paise = Number(rupees) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(paise) && paise > 0 && paise <= MAX_AMOUNT
    ? paise
    : null;
}
export function indiaToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((type) => parts.find((p) => p.type === type)!.value)
    .join("-");
}
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(value + "T00:00:00Z");
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value >= "1900-01-01"
  );
}
export function validEntry(
  value: unknown,
  today = indiaToday(),
): value is Entry {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  return (
    Object.keys(v).sort().join(",") === "amountPaise,category,date,id,type" &&
    typeof v.id === "string" &&
    /^[a-zA-Z0-9-]{1,64}$/.test(v.id) &&
    (v.type === "income" || v.type === "expense") &&
    Number.isSafeInteger(v.amountPaise) &&
    Number(v.amountPaise) > 0 &&
    Number(v.amountPaise) <= MAX_AMOUNT &&
    validDate(v.date) &&
    v.date <= today &&
    (categories[v.type] as readonly unknown[]).includes(v.category)
  );
}
export function sevenDates(today = indiaToday()): string[] {
  const day = new Date(today + "T00:00:00Z");
  return Array.from({ length: 7 }, (_, i) =>
    new Date(day.getTime() - (6 - i) * 86_400_000).toISOString().slice(0, 10),
  );
}
export function totals(entries: readonly Entry[]) {
  let incomePaise = 0,
    expensePaise = 0;
  for (const entry of entries) {
    if (entry.type === "income") incomePaise += entry.amountPaise;
    else expensePaise += entry.amountPaise;
  }
  return {
    incomePaise,
    expensePaise,
    netPaise: incomePaise - expensePaise,
    count: entries.length,
  };
}
export function weekSummary(entries: readonly Entry[], today = indiaToday()) {
  const dates = sevenDates(today);
  const days = dates.map((date) => ({
    date,
    ...totals(entries.filter((e) => e.date === date)),
  }));
  const matching = entries.filter((e) => e.date >= dates[0] && e.date <= today);
  return { from: dates[0], to: today, ...totals(matching), days };
}
export type EarningsSummary = ReturnType<typeof weekSummary>;
export function summaryContext(summary: EarningsSummary, t: Strings): string {
  return `${t.explain}\n${summary.from} — ${summary.to}\n${t.income}: INR ${(summary.incomePaise / 100).toFixed(2)}; ${t.expense}: INR ${(summary.expensePaise / 100).toFixed(2)}; ${t.net}: INR ${(summary.netPaise / 100).toFixed(2)}; ${summary.count} ${t.recorded}`;
}
export function money(paise: number, language: Language = "en") {
  return new Intl.NumberFormat(locales[language], {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}
export function displayDate(date: string, language: Language = "en") {
  if (language === "pa") {
    const months = [
      "ਜਨਵਰੀ",
      "ਫ਼ਰਵਰੀ",
      "ਮਾਰਚ",
      "ਅਪ੍ਰੈਲ",
      "ਮਈ",
      "ਜੂਨ",
      "ਜੁਲਾਈ",
      "ਅਗਸਤ",
      "ਸਤੰਬਰ",
      "ਅਕਤੂਬਰ",
      "ਨਵੰਬਰ",
      "ਦਸੰਬਰ",
    ];
    return `${Number(date.slice(8, 10))} ${months[Number(date.slice(5, 7)) - 1]}`;
  }
  return new Intl.DateTimeFormat(locales[language], {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}
