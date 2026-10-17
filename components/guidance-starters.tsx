"use client";
import { useState } from "react";
import { ArrowUpRight, ShieldCheck, Scale, HeartHandshake } from "lucide-react";
import { translations } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";
import { guidance, officialSources } from "@/lib/guidance";
import {
  indianStates,
  unionTerritories,
  regionLabels,
} from "@/lib/india-regions";

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
  const [topic, setTopic] = useState<"safety" | "rights" | "welfare" | null>(
    null,
  );
  const icons = { safety: ShieldCheck, rights: Scale, welfare: HeartHandshake };
  return (
    <section className="guidance-starters">
      <h2>{t.title}</h2>
      <div className="guidance-grid">
        {(["safety", "rights", "welfare"] as const).map((item) => {
          const Icon = icons[item];
          return (
            <button
              type="button"
              className={`guidance-card ${item}`}
              key={item}
              disabled={disabled}
              aria-expanded={topic === item}
              onClick={() => setTopic(topic === item ? null : item)}
            >
              <span className="guidance-icon">
                <Icon size={24} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <strong>{t[item]}</strong>
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      {topic && (
        <form
          className="guidance-context"
          onSubmit={(e) => {
            e.preventDefault();
            if (disabled) return;
            onChoose(
              `${t[`${topic}Prompt`]}${state.trim() ? `\n${t.state}: ${state.trim()}` : ""}${work.trim() ? `\n${t.work}: ${work.trim()}` : ""}`,
            );
          }}
        >
          <p className="muted">{t.hint}</p>
          <div className="guidance-fields">
            <label className="field">
              {t.state}
              <select value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">{regionLabels[language].choose}</option>
                <optgroup label={regionLabels[language].states}>
                  {indianStates.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={regionLabels[language].territories}>
                  {unionTerritories.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </optgroup>
              </select>
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
          <button className="button" disabled={disabled}>
            {translations[language].ask}
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
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
        </form>
      )}
    </section>
  );
}
