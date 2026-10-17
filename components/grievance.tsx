"use client";
import { useRef, useState } from "react";
import { Copy, MessageSquareText, Sparkles } from "lucide-react";
import { askAi } from "@/lib/ai-client";
import {
  AiError,
  issues,
  validateRequest,
  type GrievanceFacts,
} from "@/lib/api-validation";
import { indiaToday } from "@/lib/earnings";
import type { Language, Strings } from "@/lib/i18n";
import { accountStrings } from "@/lib/account-i18n";
import { ReadAloudButton } from "./read-aloud-button";

export type GrievanceState = {
  facts: GrievanceFacts;
  draft: string;
  busy: boolean;
  error: string;
  confirmed: boolean;
  outputLanguage: Language | null;
};
export const initialGrievance: GrievanceState = {
  facts: {
    name: "",
    employer: "",
    issue: "unpaid",
    incident: "",
    disputed: "",
    description: "",
    resolution: "",
  },
  draft: "",
  busy: false,
  error: "",
  confirmed: false,
  outputLanguage: null,
};
export function Grievance({
  state,
  setState,
  t,
  language,
  persisted = false,
}: {
  state: GrievanceState;
  setState: React.Dispatch<React.SetStateAction<GrievanceState>>;
  t: Strings;
  language: Language;
  persisted?: boolean;
}) {
  const lock = useRef(false);
  const [copyStatus, setCopyStatus] = useState("");
  function change<K extends keyof GrievanceFacts>(
    key: K,
    value: GrievanceFacts[K],
  ) {
    setState((s) => ({
      ...s,
      facts: { ...s.facts, [key]: value },
      confirmed: false,
      error: "",
    }));
  }
  async function generate() {
    if (lock.current) return;
    const request = {
      task: "grievance-draft" as const,
      language: state.outputLanguage ?? language,
      facts: state.facts,
    };
    try {
      if (!state.confirmed) throw new Error("INVALID");
      validateRequest(request, indiaToday());
    } catch {
      setState((s) => ({ ...s, error: "required" }));
      return;
    }
    lock.current = true;
    setState((s) => ({ ...s, busy: true, error: "" }));
    setCopyStatus("");
    try {
      const draft = await askAi(request);
      setState((s) => ({ ...s, draft, busy: false }));
    } catch (error) {
      setState((s) => ({
        ...s,
        busy: false,
        error: error instanceof AiError ? error.code : "UPSTREAM",
      }));
    } finally {
      lock.current = false;
    }
  }
  return (
    <div className="stack">
      <section className="card">
        <div className="section-heading">
          <h2>{t.grievance}</h2>
          <MessageSquareText size={22} />
        </div>
        <p className="notice">{t.docPrivacy}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
          className="form-grid"
        >
          <label className="field" htmlFor="grievance-name">
            {t.name}
            <input
              id="grievance-name"
              name="worker-name"
              autoComplete="name"
              value={state.facts.name}
              onChange={(e) => change("name", e.target.value)}
              maxLength={100}
              disabled={state.busy}
            />
          </label>
          <label className="field" htmlFor="grievance-employer">
            {t.employer}
            <input
              id="grievance-employer"
              name="employer-name"
              autoComplete="organization"
              value={state.facts.employer}
              onChange={(e) => change("employer", e.target.value)}
              maxLength={160}
              required
              aria-required="true"
              disabled={state.busy}
              aria-describedby="grievance-error"
            />
          </label>
          <label className="field" htmlFor="grievance-issue">
            {t.issue}
            <select
              id="grievance-issue"
              name="grievance-issue"
              value={state.facts.issue}
              onChange={(e) =>
                change("issue", e.target.value as GrievanceFacts["issue"])
              }
              disabled={state.busy}
            >
              {issues.map((issue) => (
                <option key={issue} value={issue}>
                  {t[issue]}
                </option>
              ))}
            </select>
          </label>
          <label className="field" htmlFor="grievance-incident">
            {t.incident}
            <input
              id="grievance-incident"
              name="incident-date"
              type="date"
              min="1900-01-01"
              max={indiaToday()}
              value={state.facts.incident}
              onChange={(e) => change("incident", e.target.value)}
              required
              aria-required="true"
              disabled={state.busy}
              aria-describedby="grievance-error"
            />
          </label>
          <label className="field" htmlFor="grievance-disputed">
            {t.disputed}
            <input
              id="grievance-disputed"
              name="disputed-amount"
              inputMode="decimal"
              value={state.facts.disputed}
              onChange={(e) => change("disputed", e.target.value)}
              maxLength={10}
              disabled={state.busy}
              aria-describedby="grievance-error"
            />
          </label>
          <label className="field" htmlFor="grievance-output-language">
            {t.outputLanguage}
            <select
              id="grievance-output-language"
              name="output-language"
              value={state.outputLanguage ?? language}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  outputLanguage: e.target.value as Language,
                }))
              }
              disabled={state.busy}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
            </select>
          </label>
          <label className="field full" htmlFor="grievance-description">
            {t.description}
            <textarea
              id="grievance-description"
              name="grievance-description"
              value={state.facts.description}
              onChange={(e) => change("description", e.target.value)}
              minLength={10}
              maxLength={3000}
              required
              aria-required="true"
              disabled={state.busy}
              aria-describedby="grievance-error"
            />
            <span className="counter">
              {state.facts.description.length}/3000
            </span>
          </label>
          <label className="field full" htmlFor="grievance-resolution">
            {t.resolution}
            <textarea
              id="grievance-resolution"
              name="grievance-resolution"
              value={state.facts.resolution}
              onChange={(e) => change("resolution", e.target.value)}
              minLength={3}
              maxLength={1000}
              required
              aria-required="true"
              disabled={state.busy}
              aria-describedby="grievance-error"
            />
            <span className="counter">
              {state.facts.resolution.length}/1000
            </span>
          </label>
          <label className="checkbox full" htmlFor="grievance-confirmed-check">
            <input
              id="grievance-confirmed-check"
              name="confirmed-check"
              type="checkbox"
              checked={state.confirmed}
              onChange={(e) =>
                setState((s) => ({ ...s, confirmed: e.target.checked }))
              }
              required
              aria-required="true"
              disabled={state.busy}
            />
            {t.review}
          </label>
          <div id="grievance-error" className="full">
            {state.error && (
              <p role="alert" className="notice error">
                {t[state.error as keyof Strings] || t.aiError}
              </p>
            )}
          </div>
          <div className="full button-row">
            <button
              className="button"
              disabled={state.busy || !state.confirmed}
            >
              <Sparkles size={17} />
              {state.busy
                ? t.thinking
                : state.draft
                  ? t.regenerate
                  : t.generate}
            </button>
            {state.error && (
              <button
                type="button"
                className="button secondary"
                onClick={generate}
                disabled={state.busy}
              >
                {t.retry}
              </button>
            )}
          </div>
        </form>
        <p className="muted">
          {persisted ? accountStrings[language].privacy : t.refresh}
        </p>
      </section>
      {state.draft && (
        <section className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <label className="field" htmlFor="grievance-draft-text" style={{ margin: 0 }}>
              {t.draftLabel}
            </label>
            <ReadAloudButton
              text={state.draft}
              language={state.outputLanguage ?? language}
            />
          </div>
          <textarea
            id="grievance-draft-text"
            name="grievance-draft"
            lang={state.outputLanguage ?? language}
            rows={18}
            value={state.draft}
            onChange={(e) => {
              setState((s) => ({ ...s, draft: e.target.value }));
              setCopyStatus("");
            }}
            maxLength={20000}
          />
          <p className="muted">{t.aiNotice}</p>
          <div className="button-row" style={{ marginTop: "12px" }}>
            <button
              className="button secondary"
              disabled={!state.draft.trim()}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(state.draft);
                  setCopyStatus("copied");
                } catch {
                  setCopyStatus("copyError");
                }
              }}
            >
              <Copy size={17} />
              {t.copy}
            </button>
          </div>
          <p role="status" aria-live="polite" className="muted" style={{ minHeight: "20px", marginTop: "8px" }}>
            {copyStatus ? t[copyStatus as keyof Strings] : ""}
          </p>
        </section>
      )}
    </div>
  );
}
