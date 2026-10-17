"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  House,
  Wallet,
  Sparkles,
  FileText,
  MessageSquareText,
  Sprout,
  Languages,
  ShieldCheck,
} from "lucide-react";
import { translations, type Language } from "@/lib/i18n";
import { Dashboard, Earnings, SummaryCards } from "./earnings";
import {
  indiaToday,
  weekSummary,
  summaryContext,
  type Entry,
} from "@/lib/earnings";
import { decodeEntries, saveEntries, STORAGE_KEY } from "@/lib/storage";
import { Assistant, initialAssistant } from "./assistant";
import { Modal } from "./modal";
import { Documents, initialDocument } from "./documents";
import { Grievance, initialGrievance } from "./grievance";
import { askAi } from "@/lib/ai-client";
import { AiError } from "@/lib/api-validation";
const sections = [
  "dashboard",
  "earnings",
  "chat",
  "documents",
  "grievance",
] as const;
type Section = (typeof sections)[number];
const icons = {
  dashboard: House,
  earnings: Wallet,
  chat: Sparkles,
  documents: FileText,
  grievance: MessageSquareText,
};
let memoryLanguage: Language | null = null;
function subscribeLanguage(callback: () => void) {
  window.addEventListener("aasra-language", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("aasra-language", callback);
    window.removeEventListener("storage", callback);
  };
}
function readLanguage(): Language {
  if (memoryLanguage) return memoryLanguage;
  try {
    const value = localStorage.getItem("aasra-language");
    return value === "hi" || value === "pa" ? value : "en";
  } catch {
    return "en";
  }
}
export function Aasra() {
  const language = useSyncExternalStore(
    subscribeLanguage,
    readLanguage,
    () => "en" as Language,
  );
  const [section, setSection] = useState<Section>("dashboard");
  const t = translations[language];
  const [entries, setEntries] = useState<Entry[]>([]),
    [ready, setReady] = useState(false),
    [storageBlocked, setStorageBlocked] = useState(false),
    [status, setStatus] = useState(""),
    [pendingDelete, setPendingDelete] = useState<Entry | null>(null),
    [today, setToday] = useState("");
  const [assistant, setAssistant] = useState(initialAssistant),
    [sharing, setSharing] = useState(false);
  const [documentState, setDocumentState] = useState(initialDocument),
    [grievance, setGrievance] = useState(initialGrievance);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setEntries(decodeEntries(localStorage.getItem(STORAGE_KEY)));
      } catch {
        setStorageBlocked(true);
        setStatus("storageInvalid");
      }
      setToday(indiaToday());
      setReady(true);
    });
    const timer = setInterval(() => setToday(indiaToday()), 30_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const summary = weekSummary(entries, today || "1970-01-07");
  function navigate(next: Section) {
    setSection(next);
    setStatus("");
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => document.getElementById("main")?.focus());
  }
  function persist(next: Entry[]) {
    if (storageBlocked) {
      setStatus("storageInvalid");
      return false;
    }
    try {
      saveEntries(localStorage, next);
      setEntries(next);
      setStatus("saved");
      return true;
    } catch {
      setStatus("storageError");
      return false;
    }
  }
  function save(entry: Entry) {
    return persist(
      entries.some((e) => e.id === entry.id)
        ? entries.map((e) => (e.id === entry.id ? entry : e))
        : [...entries, entry],
    );
  }
  function explain() {
    if (!summary.count) {
      setStatus("noEntries");
      return;
    }
    setSharing(true);
  }
  async function shareEarnings() {
    if (assistant.busy) return;
    const request = {
      task: "earnings-explanation" as const,
      language,
      summary,
    };
    const context = summaryContext(summary, t);
    setAssistant((s) => ({ ...s, busy: true, error: "", pending: request }));
    setSharing(false);
    navigate("chat");
    try {
      const text = await askAi(request);
      setAssistant((s) => ({
        ...s,
        busy: false,
        pending: null,
        messages: [
          ...s.messages,
          { role: "user", text: context },
          { role: "assistant", text },
        ],
      }));
    } catch (error) {
      setAssistant((s) => ({
        ...s,
        busy: false,
        error: error instanceof AiError ? error.code : "UPSTREAM",
      }));
    }
  }
  function changeLanguage(value: Language) {
    memoryLanguage = value;
    setGrievance((s) => ({ ...s, outputLanguage: null }));
    try {
      localStorage.setItem("aasra-language", value);
    } catch {
      setStatus("storageError");
    }
    window.dispatchEvent(new Event("aasra-language"));
  }
  return (
    <div className="app-shell">
      <a href="#main" className="skip">
        {language === "hi"
          ? "मुख्य सामग्री पर जाएँ"
          : language === "pa"
            ? "ਮੁੱਖ ਸਮੱਗਰੀ ਤੇ ਜਾਓ"
            : "Skip to content"}
      </a>
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Aasra">
          <span className="brand-symbol">
            <Sprout />
          </span>
          Aasra<span className="brand-dot">.</span>
        </Link>
        <p className="brand-tag">{t.tagline}</p>
        <p className="eyebrow nav-label">{t.tools}</p>
        <nav aria-label={t.tools}>
          {sections.map((s) => {
            const Icon = icons[s];
            return (
              <button
                key={s}
                onClick={() => navigate(s)}
                aria-current={section === s ? "page" : undefined}
                className={section === s ? "nav-item active" : "nav-item"}
              >
                <Icon size={21} />
                <span>{t[s]}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <ShieldCheck size={23} />
          <p>{t.privacy}</p>
          <span>AASRA</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="mobile-brand">
            <Sprout size={23} /> Aasra.
          </div>
          <span className="desktop-breadcrumb">
            Aasra <span>/</span> {t[section]}
          </span>
          <label className="language">
            <Languages size={18} />
            <span className="sr-only">{t.language}</span>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
            </select>
          </label>
        </header>
        <main id="main" tabIndex={-1}>
          <p className="eyebrow">{t.overview}</p>
          <h1>
            {section === "dashboard"
              ? t.welcome
              : section === "chat"
                ? t.chatTitle
                : section === "documents"
                  ? t.docTitle
                  : section === "grievance"
                    ? t.grievanceTitle
                    : t.earnings}
          </h1>
          <p className="lead">
            {section === "dashboard"
              ? t.intro
              : section === "documents"
                ? t.docIntro
                : section === "grievance"
                  ? t.grievanceIntro
                  : section === "chat"
                    ? t.chatIntro
                    : t.sevenDays}
          </p>
          {status && (
            <p
              role="status"
              className={
                "notice " + (status.startsWith("storage") ? "error" : "")
              }
            >
              {t[status as keyof typeof t]}
            </p>
          )}
          {!ready ? (
            <p role="status">{t.loading}</p>
          ) : (
            <>
              <div hidden={section !== "dashboard"}>
                <Dashboard
                  entries={entries}
                  summary={summary}
                  language={language}
                  t={t}
                  navigate={navigate}
                  onExplain={explain}
                />
              </div>
              <div hidden={section !== "earnings"}>
                <Earnings
                  entries={entries}
                  summary={summary}
                  language={language}
                  t={t}
                  onSave={save}
                  onDelete={setPendingDelete}
                  onExplain={explain}
                  onConcern={() => navigate("grievance")}
                />
              </div>
              <div hidden={section !== "chat"}>
                <Assistant
                  state={assistant}
                  setState={setAssistant}
                  language={language}
                  t={t}
                  active={section === "chat"}
                />
              </div>
              <div hidden={section !== "documents"}>
                <Documents
                  transferDisabled={grievance.busy}
                  state={documentState}
                  setState={setDocumentState}
                  language={language}
                  t={t}
                  onTransfer={(facts) => {
                    if (grievance.busy) return;
                    setGrievance((s) => ({
                      ...s,
                      facts: { ...s.facts, description: facts },
                      draft: "",
                      confirmed: false,
                      error: "",
                    }));
                    navigate("grievance");
                  }}
                />
              </div>
              <div hidden={section !== "grievance"}>
                <Grievance
                  state={grievance}
                  setState={setGrievance}
                  language={language}
                  t={t}
                />
              </div>
            </>
          )}
        </main>
        <footer>
          {t.support}
          <span>
            <ShieldCheck size={14} /> {t.session}
          </span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label={t.tools}>
        {sections.map((s) => {
          const Icon = icons[s];
          return (
            <button
              key={s}
              aria-current={section === s ? "page" : undefined}
              onClick={() => navigate(s)}
            >
              <Icon size={21} />
              <span>{t[s]}</span>
            </button>
          );
        })}
      </nav>
      {pendingDelete && (
        <Modal title={t.confirmDelete} onClose={() => setPendingDelete(null)}>
          {status.startsWith("storage") && (
            <p role="alert" className="notice error">
              {t[status as keyof typeof t]}
            </p>
          )}
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => setPendingDelete(null)}
            >
              {t.cancel}
            </button>
            <button
              className="button danger"
              onClick={() => {
                if (persist(entries.filter((e) => e.id !== pendingDelete.id))) {
                  setStatus("deleted");
                  setPendingDelete(null);
                }
              }}
            >
              {t.deleteConfirm}
            </button>
          </div>
        </Modal>
      )}
      {sharing && (
        <Modal title={t.shareTitle} onClose={() => setSharing(false)}>
          <p className="muted">{t.shareHint}</p>
          <p className="muted">
            {summary.from} — {summary.to}
          </p>
          <SummaryCards summary={summary} language={language} t={t} />
          <ul className="share-data">
            {summary.days.map((day) => (
              <li key={day.date}>
                {day.date}: {t.income} ₹{(day.incomePaise / 100).toFixed(2)} ·{" "}
                {t.expense} ₹{(day.expensePaise / 100).toFixed(2)} · {t.net} ₹
                {(day.netPaise / 100).toFixed(2)} · {t.entryCount}: {day.count}
              </li>
            ))}
          </ul>
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => setSharing(false)}
            >
              {t.cancel}
            </button>
            <button
              className="button"
              disabled={assistant.busy}
              onClick={shareEarnings}
            >
              {t.consent}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
