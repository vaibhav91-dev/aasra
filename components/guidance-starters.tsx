"use client";
import { useState } from "react";
import type { Language } from "@/lib/i18n";
import { guidance, officialSources } from "@/lib/guidance";

export function GuidanceStarters({
  language,
  onChoose,
  disabled = false,
}: {
  language: Language;
  onChoose: (prompt: string) => void;
  disabled?: boolean;
}) {
  const t = guidance[language];
  const [state, setState] = useState("");
  const [work, setWork] = useState("");
  return (
    <section className="card guidance-starters">
      <h2>{t.title}</h2>
      <p className="muted">{t.hint}</p>
      <div className="prompt-grid">
        <label className="field">
          {t.state}
          <input
            maxLength={80}
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </label>
        <label className="field">
          {t.work}
          <input
            maxLength={100}
            value={work}
            onChange={(e) => setWork(e.target.value)}
          />
        </label>
      </div>
      <div className="button-row">
        {(["safety", "rights", "welfare"] as const).map((topic) => (
          <button
            className="button secondary"
            key={topic}
            disabled={disabled}
            onClick={() =>
              onChoose(
                `${t[`${topic}Prompt`]}${state.trim() ? `\n${t.state}: ${state.trim()}` : ""}${work.trim() ? `\n${t.work}: ${work.trim()}` : ""}`,
              )
            }
          >
            {t[topic]}
          </button>
        ))}
      </div>
      <p className="muted">{t.caveat}</p>
      <nav aria-label={t.sources} className="button-row">
        {officialSources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="button ghost"
          >
            {source.title} ↗
          </a>
        ))}
      </nav>
    </section>
  );
}
