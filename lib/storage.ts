import { MAX_ENTRIES, validEntry, type Entry } from "./earnings";
export const STORAGE_KEY = "aasra-earnings-v1";
export function decodeEntries(raw: string | null): Entry[] {
  if (raw === null) return [];
  if (raw.length > 2_000_000) throw new Error("storageInvalid");
  const data: unknown = JSON.parse(raw);
  if (
    !data ||
    typeof data !== "object" ||
    !("version" in data) ||
    data.version !== 1 ||
    !("entries" in data) ||
    !Array.isArray(data.entries) ||
    data.entries.length > MAX_ENTRIES ||
    !data.entries.every((e) => validEntry(e)) ||
    new Set(data.entries.map((e) => e.id)).size !== data.entries.length
  )
    throw new Error("storageInvalid");
  return data.entries;
}
export function saveEntries(
  storage: Pick<Storage, "setItem">,
  entries: Entry[],
) {
  if (entries.length > MAX_ENTRIES || !entries.every((e) => validEntry(e)))
    throw new Error("invalid");
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries }));
}
