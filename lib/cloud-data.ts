import type { Entry } from "./earnings";
import { MAX_ENTRIES, validEntry } from "./earnings";
import { issues, type GrievanceFacts, type Message } from "./api-validation";
import type { Language } from "./i18n";
export type SavedData = {
  version: 1;
  entries: Entry[];
  messages: Message[];
  grievance: {
    facts: GrievanceFacts;
    draft: string;
    outputLanguage: Language | null;
  };
};
function obj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function exact(v: Record<string, unknown>, fields: string[]) {
  return Object.keys(v).sort().join(",") === [...fields].sort().join(",");
}
function str(v: unknown, max: number): v is string {
  return typeof v === "string" && v.length <= max;
}
export function validSavedData(v: unknown): v is SavedData {
  if (
    !obj(v) ||
    !exact(v, ["version", "entries", "messages", "grievance"]) ||
    v.version !== 1 ||
    !Array.isArray(v.entries) ||
    v.entries.length > MAX_ENTRIES ||
    !v.entries.every((e) => validEntry(e)) ||
    new Set(v.entries.map((e) => e.id)).size !== v.entries.length ||
    !Array.isArray(v.messages) ||
    v.messages.length > 20 ||
    v.messages.length % 2 !== 0
  )
    return false;
  let characters = 0;
  for (let i = 0; i < v.messages.length; i++) {
    const m: unknown = v.messages[i];
    if (
      !obj(m) ||
      !exact(m, ["role", "text"]) ||
      m.role !== (i % 2 === 0 ? "user" : "assistant") ||
      !str(m.text, i % 2 === 0 ? 3000 : 12000) ||
      !m.text.trim()
    )
      return false;
    characters += m.text.length;
  }
  if (characters > 150000) return false;
  const g = v.grievance;
  if (
    !obj(g) ||
    !exact(g, ["facts", "draft", "outputLanguage"]) ||
    !str(g.draft, 20000) ||
    !(
      g.outputLanguage === null ||
      ["en", "hi", "pa"].includes(String(g.outputLanguage))
    ) ||
    !obj(g.facts)
  )
    return false;
  const f = g.facts;
  return (
    exact(f, [
      "name",
      "employer",
      "issue",
      "incident",
      "disputed",
      "description",
      "resolution",
    ]) &&
    str(f.name, 100) &&
    str(f.employer, 160) &&
    issues.includes(f.issue as (typeof issues)[number]) &&
    str(f.incident, 10) &&
    (f.incident === "" || /^\d{4}-\d{2}-\d{2}$/.test(f.incident)) &&
    str(f.disputed, 10) &&
    str(f.description, 3000) &&
    str(f.resolution, 1000)
  );
}
