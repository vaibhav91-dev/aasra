"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { validSavedData, type SavedData } from "./cloud-data";
export type CloudUser = { id: string; name: string };
function fingerprint(value: SavedData) {
  return JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([a], [b]) => a.localeCompare(b)),
        )
      : item,
  );
}
export type SyncStatus =
  | "checking"
  | "guest"
  | "cloudLoading"
  | "cloudSaved"
  | "cloudSaving"
  | "cloudPending"
  | "cloudError"
  | "cloudConflict"
  | "cloudUnavailable";
export function useCloudAccount(
  data: SavedData,
  hydrate: (value: SavedData | null) => void,
  enabled: boolean,
) {
  const [user, setUser] = useState<CloudUser | null>(null),
    [configured, setConfigured] = useState<boolean | null>(null),
    [status, setStatus] = useState<SyncStatus>("checking"),
    [acknowledged, setAcknowledged] = useState("");
  const userRef = useRef<CloudUser | null>(null),
    revision = useRef(0),
    lastSaved = useRef(""),
    loading = useRef(true),
    writing = useRef(false),
    conflict = useRef(false),
    hydrateRef = useRef(hydrate),
    dataRef = useRef(data),
    generation = useRef(0);
  useEffect(() => {
    hydrateRef.current = hydrate;
    dataRef.current = data;
  });
  const reload = useCallback(async () => {
    const round = ++generation.current;
    loading.current = true;
    setStatus("cloudLoading");
    try {
      const response = await fetch("/api/account", {
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error();
      const account = await response.json();
      if (round !== generation.current) return;
      setConfigured(account.configured === true);
      if (!account.user) {
        if (userRef.current) hydrateRef.current(null);
        userRef.current = null;
        setUser(null);
        setStatus("guest");
        loading.current = false;
        return;
      }
      userRef.current = account.user;
      setUser(account.user);
      const records = await fetch("/api/data", {
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      });
      if (!records.ok) throw new Error();
      const saved = await records.json();
      if (round !== generation.current) return;
      if (saved.data !== null && !validSavedData(saved.data)) throw new Error();
      if (!Number.isSafeInteger(saved.revision) || saved.revision < 0)
        throw new Error();
      revision.current = saved.revision;
      lastSaved.current = saved.data ? fingerprint(saved.data) : "";
      setAcknowledged(lastSaved.current);
      conflict.current = false;
      hydrateRef.current(saved.data);
      loading.current = false;
      setStatus("cloudSaved");
    } catch {
      if (round === generation.current) {
        setStatus("cloudUnavailable");
        loading.current = true;
      }
    }
  }, []);
  const invalidate = useCallback(() => {
    generation.current++;
  }, []);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (enabled && active) void reload();
    });
    return () => {
      active = false;
      invalidate();
    };
  }, [enabled, reload, invalidate]);
  const save = useCallback(async (value: SavedData): Promise<boolean> => {
    if (
      !userRef.current ||
      loading.current ||
      writing.current ||
      conflict.current
    )
      return false;
    const serialized = fingerprint(value);
    if (serialized === lastSaved.current) return true;
    if (!validSavedData(value)) {
      setStatus("cloudError");
      return false;
    }
    writing.current = true;
    setStatus("cloudSaving");
    const round = generation.current;
    try {
      const response = await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: value, revision: revision.current }),
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 409) {
        conflict.current = true;
        setStatus("cloudConflict");
        return false;
      }
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (round !== generation.current) return false;
      if (!Number.isSafeInteger(result.revision)) throw new Error();
      revision.current = result.revision;
      lastSaved.current = serialized;
      setAcknowledged(serialized);
      setStatus("cloudSaved");
      return true;
    } catch {
      setStatus("cloudError");
      return false;
    } finally {
      writing.current = false;
    }
  }, []);
  const serialized = fingerprint(data);
  useEffect(() => {
    if (
      !user ||
      loading.current ||
      writing.current ||
      conflict.current ||
      status === "cloudError" ||
      status === "cloudUnavailable" ||
      serialized === lastSaved.current
    )
      return;
    const timer = setTimeout(() => void save(dataRef.current), 800);
    return () => clearTimeout(timer);
  }, [serialized, user, save, status]);
  const dirty = !!user && serialized !== acknowledged;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function reset() {
    generation.current++;
    userRef.current = null;
    setUser(null);
    lastSaved.current = "";
    setAcknowledged("");
    revision.current = 0;
    conflict.current = false;
    loading.current = false;
    setStatus("guest");
  }
  return {
    user,
    configured,
    status,
    dirty,
    blocked:
      status === "checking" ||
      status === "cloudLoading" ||
      status === "cloudUnavailable",
    save,
    reload,
    reset,
  };
}
