import {
  MAX_AMOUNT,
  sevenDates,
  validDate,
  type EarningsSummary,
} from "./earnings";
import type { Language } from "./i18n";
export type Message = { role: "user" | "assistant"; text: string };
export const issues = [
  "unpaid",
  "deduction",
  "suspension",
  "unsafe",
  "harassment",
  "other",
] as const;
export type GrievanceFacts = {
  name: string;
  employer: string;
  issue: (typeof issues)[number];
  incident: string;
  disputed: string;
  description: string;
  resolution: string;
};
export type AiRequest =
  | { task: "chat"; language: Language; messages: Message[] }
  | {
      task: "earnings-explanation";
      language: Language;
      summary: EarningsSummary;
    }
  | { task: "document-explanation"; language: Language; text: string }
  | { task: "grievance-draft"; language: Language; facts: GrievanceFacts };
export type ErrorCode =
  | "INVALID"
  | "TOO_LARGE"
  | "ORIGIN"
  | "CONFIG"
  | "CREDENTIALS"
  | "MODEL"
  | "QUOTA"
  | "TIMEOUT"
  | "UPSTREAM"
  | "EMPTY";
export class AiError extends Error {
  constructor(
    public code: ErrorCode,
    public status: number,
  ) {
    super(code);
  }
}
function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, expected: string[]) {
  return Object.keys(value).sort().join(",") === [...expected].sort().join(",");
}
function text(value: unknown, max: number, min = 1): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= min &&
    value.length <= max
  );
}
function integer(value: unknown, max = MAX_AMOUNT * 10000) {
  return (
    Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) <= max
  );
}
export function validSummary(value: unknown): value is EarningsSummary {
  if (
    !object(value) ||
    !keys(value, [
      "from",
      "to",
      "incomePaise",
      "expensePaise",
      "netPaise",
      "count",
      "days",
    ]) ||
    !validDate(value.from) ||
    !validDate(value.to) ||
    !Array.isArray(value.days) ||
    value.days.length !== 7
  )
    return false;
  const dates = sevenDates(value.to);
  if (value.from !== dates[0]) return false;
  let income = 0,
    expense = 0,
    count = 0;
  for (let i = 0; i < 7; i++) {
    const d: unknown = value.days[i];
    if (
      !object(d) ||
      !keys(d, ["date", "incomePaise", "expensePaise", "netPaise", "count"]) ||
      d.date !== dates[i] ||
      !integer(d.incomePaise) ||
      !integer(d.expensePaise) ||
      !integer(d.count, 10000) ||
      d.netPaise !== Number(d.incomePaise) - Number(d.expensePaise) ||
      (d.count === 0 && (d.incomePaise !== 0 || d.expensePaise !== 0))
    )
      return false;
    income += Number(d.incomePaise);
    expense += Number(d.expensePaise);
    count += Number(d.count);
  }
  return (
    integer(value.incomePaise) &&
    integer(value.expensePaise) &&
    integer(value.count, 10000) &&
    value.incomePaise === income &&
    value.expensePaise === expense &&
    value.netPaise === income - expense &&
    value.count === count
  );
}
export function validateRequest(value: unknown, today: string): AiRequest {
  const invalid = () => {
    throw new AiError("INVALID", 400);
  };
  if (
    !object(value) ||
    (value.language !== "en" &&
      value.language !== "hi" &&
      value.language !== "pa")
  )
    return invalid();
  switch (value.task) {
    case "chat": {
      if (
        !keys(value, ["task", "language", "messages"]) ||
        !Array.isArray(value.messages) ||
        value.messages.length < 1 ||
        value.messages.length > 20
      )
        return invalid();
      let size = 0;
      for (let i = 0; i < value.messages.length; i++) {
        const m: unknown = value.messages[i];
        if (
          !object(m) ||
          !keys(m, ["role", "text"]) ||
          m.role !== (i % 2 === 0 ? "user" : "assistant") ||
          !text(m.text, m.role === "user" ? 3000 : 12000)
        )
          return invalid();
        size += m.text.length;
      }
      if (value.messages.length % 2 !== 1 || size > 24000) return invalid();
      break;
    }
    case "earnings-explanation":
      if (
        !keys(value, ["task", "language", "summary"]) ||
        !validSummary(value.summary) ||
        value.summary.to !== today ||
        value.summary.count === 0
      )
        return invalid();
      break;
    case "document-explanation":
      if (
        !keys(value, ["task", "language", "text"]) ||
        !text(value.text, 8000, 10)
      )
        return invalid();
      break;
    case "grievance-draft": {
      if (!keys(value, ["task", "language", "facts"]) || !object(value.facts))
        return invalid();
      const f = value.facts;
      if (
        !keys(f, [
          "name",
          "employer",
          "issue",
          "incident",
          "disputed",
          "description",
          "resolution",
        ]) ||
        !text(f.name, 100, 0) ||
        !text(f.employer, 160) ||
        !issues.includes(f.issue as (typeof issues)[number]) ||
        !validDate(f.incident) ||
        f.incident > today ||
        !text(f.disputed, 10, 0) ||
        !text(f.description, 3000, 10) ||
        !text(f.resolution, 1000, 3)
      )
        return invalid();
      if (f.disputed !== "" && !/^\d{1,7}(\.\d{1,2})?$/.test(f.disputed))
        return invalid();
      if (
        f.disputed !== "" &&
        (!(Number(f.disputed) > 0) || Number(f.disputed) > MAX_AMOUNT / 100)
      )
        return invalid();
      break;
    }
    default:
      return invalid();
  }
  return value as AiRequest;
}
