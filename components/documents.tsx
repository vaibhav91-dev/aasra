"use client";
import { useRef, useState } from "react";
import { FileText, ArrowUpRight, Sparkles } from "lucide-react";
import { askAi } from "@/lib/ai-client";
import { AiError } from "@/lib/api-validation";
import type { Language, Strings } from "@/lib/i18n";
import { Modal } from "./modal";
export type DocumentState = {
  text: string;
  consent: boolean;
  explanation: string;
  explainedText: string;
  busy: boolean;
  error: string;
};
export const initialDocument: DocumentState = {
  text: "",
  consent: false,
  explanation: "",
  explainedText: "",
  busy: false,
  error: "",
};
export function Documents({
  state,
  setState,
  t,
  language,
  onTransfer,
  transferDisabled = false,
}: {
  state: DocumentState;
  setState: React.Dispatch<React.SetStateAction<DocumentState>>;
  t: Strings;
  language: Language;
  onTransfer: (facts: string) => void;
  transferDisabled?: boolean;
}) {
  const lock = useRef(false);
  const [transfer, setTransfer] = useState(false),
    [facts, setFacts] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  async function explain() {
    if (lock.current) return;
    if (
      !state.consent ||
      state.text.trim().length < 10 ||
      state.text.length > 8000
    ) {
      setState((s) => ({ ...s, error: "INVALID" }));
      return;
    }
    const source = state.text;
    lock.current = true;
    setState((s) => ({ ...s, busy: true, error: "" }));
    try {
      const explanation = await askAi({
        task: "document-explanation",
        language,
        text: source,
      });
      setState((s) => ({
        ...s,
        explanation,
        explainedText: source,
        busy: false,
      }));
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
          <h2>{t.documents}</h2>
          <FileText size={22} />
        </div>
        <p className="notice">{t.docPrivacy}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void explain();
          }}
          className="stack"
        >
          <label className="field">
            {t.docLabel}
            <textarea
              value={state.text}
              minLength={10}
              maxLength={8000}
              rows={10}
              disabled={state.busy || transferDisabled}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  text: e.target.value,
                  consent: false,
                  error: "",
                }))
              }
              aria-describedby="doc-count doc-error"
              required
            />
          </label>
          <span id="doc-count" className="counter">
            {state.text.length}/8000
          </span>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={state.consent}
              disabled={state.busy || transferDisabled}
              onChange={(e) =>
                setState((s) => ({ ...s, consent: e.target.checked }))
              }
              required
            />
            {t.docConsent}
          </label>
          <div>
            <button
              className="button"
              disabled={
                state.busy || !state.consent || state.text.trim().length < 10
              }
            >
              <Sparkles size={17} />
              {state.busy ? t.thinking : t.docSubmit}
            </button>
          </div>
        </form>
        <div id="doc-error">
          {state.error && (
            <div className="notice error" role="alert">
              <p>{t[state.error as keyof Strings] || t.aiError}</p>
              <button
                className="button secondary"
                onClick={explain}
                disabled={state.busy || transferDisabled}
              >
                {t.retry}
              </button>
            </div>
          )}
        </div>
        <p className="muted">{t.refresh}</p>
      </section>
      {state.explanation && (
        <section className="card">
          <h2>{t.docSubmit}</h2>
          <div className="text-output">{state.explanation}</div>
          <p className="notice">{t.aiNotice}</p>
          <button
            className="button secondary"
            disabled={state.busy || transferDisabled}
            onClick={() => {
              setTransfer(true);
              setFacts("");
              setConfirmed(false);
            }}
          >
            {t.docTransfer}
            <ArrowUpRight size={17} />
          </button>
        </section>
      )}
      {transfer && (
        <Modal title={t.facts} onClose={() => setTransfer(false)}>
          <p className="muted">{t.factsHint}</p>
          <details>
            <summary>{t.docLabel}</summary>
            <div className="text-output source-text">{state.explainedText}</div>
          </details>
          <label className="field">
            {t.confirmedFacts}
            <textarea
              value={facts}
              onChange={(e) => {
                setFacts(e.target.value);
                setConfirmed(false);
              }}
              minLength={10}
              maxLength={3000}
              rows={6}
            />
          </label>
          <p className="counter">{facts.length}/3000</p>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            {t.review}
          </label>
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => setTransfer(false)}
            >
              {t.cancel}
            </button>
            <button
              className="button"
              disabled={
                transferDisabled || !confirmed || facts.trim().length < 10
              }
              onClick={() => {
                onTransfer(facts.trim());
                setTransfer(false);
              }}
            >
              {t.transfer}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
