"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, Send, Sparkles, Square, Trash2 } from "lucide-react";
import { askAi } from "@/lib/ai-client";
import { AiError, type AiRequest, type Message } from "@/lib/api-validation";
import { locales, type Language, type Strings } from "@/lib/i18n";
import { summaryContext } from "@/lib/earnings";
import { accountStrings } from "@/lib/account-i18n";
import { GuidanceStarters } from "./guidance-starters";
import { ReadAloudButton } from "./read-aloud-button";
import type { SpeechRecognitionInstance } from "@/types/speech";

export type AssistantState = {
  messages: Message[];
  input: string;
  error: string;
  busy: boolean;
  pending: AiRequest | null;
};
export const initialAssistant: AssistantState = {
  messages: [],
  input: "",
  error: "",
  busy: false,
  pending: null,
};
export function Assistant({
  state,
  setState,
  language,
  t,
  active,
  persisted = false,
}: {
  state: AssistantState;
  setState: React.Dispatch<React.SetStateAction<AssistantState>>;
  language: Language;
  t: Strings;
  active: boolean;
  persisted?: boolean;
}) {
  const [supported, setSupported] = useState(false),
    [listening, setListening] = useState(false),
    [voiceError, setVoiceError] = useState(false);
  const recognition = useRef<SpeechRecognitionInstance | null>(null),
    lock = useRef(false),
    end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() =>
      setSupported(
        typeof window !== "undefined" &&
          !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      ),
    );
    return () => recognition.current?.abort();
  }, []);

  useEffect(() => {
    if (!active) recognition.current?.abort();
  }, [active]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [state.messages, state.busy]);

  function voice() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    recognition.current = r;
    r.lang = locales[language];
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript;
      if (transcript)
        setState((s) => ({
          ...s,
          input: (s.input + " " + transcript).trim().slice(0, 3000),
        }));
    };
    r.onerror = () => {
      setVoiceError(true);
      setListening(false);
    };
    r.onend = () => setListening(false);
    setVoiceError(false);
    try {
      r.start();
      setListening(true);
    } catch {
      setVoiceError(true);
    }
  }

  async function submit(retry = false) {
    if (lock.current || state.busy) return;
    const input = state.input.trim();
    if (!retry && !input) return;
    const request: AiRequest =
      retry && state.pending
        ? { ...state.pending, language }
        : {
            task: "chat",
            language,
            messages: [...state.messages, { role: "user", text: input }],
          };
    if (
      request.task === "chat" &&
      (request.messages.length > 19 ||
        request.messages.reduce((n, m) => n + m.text.length, 0) > 24000)
    ) {
      setState((s) => ({ ...s, error: "TOO_LARGE" }));
      return;
    }
    lock.current = true;
    setState((s) => ({ ...s, busy: true, error: "", pending: request }));
    try {
      const response = await askAi(request);
      const messages: Message[] =
        request.task === "chat"
          ? [...request.messages, { role: "assistant", text: response }]
          : [
              ...state.messages,
              {
                role: "user",
                text:
                  request.task === "earnings-explanation"
                    ? summaryContext(request.summary, t)
                    : t.explain,
              },
              { role: "assistant", text: response },
            ];
      setState((s) => ({
        ...s,
        messages,
        input: request.task === "chat" ? "" : s.input,
        busy: false,
        error: "",
        pending: null,
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
    <section className="card assistant">
      <div className="section-heading">
        <div className="assistant-brand">
          <span className="quick-icon">
            <Sparkles size={22} />
          </span>
          <div>
            <h2>Aasra</h2>
            <span className="muted">
              {persisted ? accountStrings[language].cloud : t.session}
            </span>
          </div>
        </div>
        <button
          className="icon-button"
          disabled={state.busy}
          aria-label={t.clear}
          onClick={() => setState(initialAssistant)}
        >
          <Trash2 size={18} />
        </button>
      </div>
      <p className="muted">{t.chatIntro}</p>
      <GuidanceStarters
        language={language}
        disabled={state.busy}
        onChoose={(prompt) =>
          setState((s) => ({ ...s, input: prompt, error: "", pending: null }))
        }
      />
      <div className="conversation" aria-live="polite" aria-busy={state.busy}>
        {!state.messages.length && !state.busy && (
          <div className="empty">
            <div className="empty-icon">
              <Sparkles size={27} />
            </div>
            <h2>{t.chatTitle}</h2>
            <p>{t.noHistory}</p>
          </div>
        )}
        {state.messages.map((message, i) => (
          <div className={"message " + message.role} key={i}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <strong>
                {message.role === "assistant" ? "Aasra" : t.input}
              </strong>
              {message.role === "assistant" && (
                <ReadAloudButton
                  text={message.text}
                  language={language}
                />
              )}
            </div>
            <div className="text-output">{message.text}</div>
          </div>
        ))}
        {state.busy && (
          <p role="status" className="notice">
            {t.thinking}
          </p>
        )}
        <div ref={end} />
      </div>
      {state.error && (
        <div className="notice error" role="alert">
          <p>{t[state.error as keyof Strings] || t.aiError}</p>
          <button
            className="button secondary"
            onClick={() => submit(true)}
            disabled={state.busy}
          >
            {t.retry}
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label className="field" htmlFor="assistant-input-field">
          {t.input}
          <textarea
            id="assistant-input-field"
            name="assistant-input"
            value={state.input}
            maxLength={3000}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                input: e.target.value,
                pending: null,
                error: "",
              }))
            }
            rows={3}
            disabled={state.busy}
            required
            aria-required="true"
          />
        </label>
        <p className="counter">{state.input.length}/3000</p>
        <div className="button-row">
          <button
            className="button"
            disabled={state.busy || !state.input.trim()}
          >
            <Send size={17} />
            {state.busy ? t.thinking : t.send}
          </button>
          {supported && (
            <button
              type="button"
              className="button secondary"
              onClick={voice}
              disabled={state.busy}
              aria-pressed={listening}
            >
              {listening ? <Square size={17} /> : <Mic size={17} />}{" "}
              {listening ? t.stop : t.mic}
            </button>
          )}
        </div>
        {listening && (
          <p role="status" className="notice">
            {t.listening}
          </p>
        )}
        {voiceError && (
          <p role="alert" className="notice error">
            {t.voiceError}
          </p>
        )}
        {supported && <p className="muted">{t.voiceHint}</p>}
      </form>
      <p className="muted ai-footnote">{t.aiNotice}</p>
    </section>
  );
}
