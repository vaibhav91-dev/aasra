"use client";

import { Volume2, Square } from "lucide-react";
import { useSpeechSynthesis } from "@/lib/use-speech";
import type { Language } from "@/lib/i18n";

const labels: Record<Language, { speak: string; stop: string }> = {
  en: { speak: "Listen", stop: "Stop" },
  hi: { speak: "सुनें", stop: "रोकें" },
  pa: { speak: "ਸੁਣੋ", stop: "ਰੋਕੋ" },
};

export function ReadAloudButton({
  text,
  language,
  className = "button ghost listen-button",
}: {
  text: string;
  language: Language;
  className?: string;
}) {
  const { supported, speaking, speak, stop } = useSpeechSynthesis();
  const l = labels[language] ?? labels.en;

  if (!supported || !text.trim()) return null;

  return (
    <button
      type="button"
      className={className}
      onClick={() => (speaking ? stop() : speak(text, language))}
      aria-label={speaking ? l.stop : l.speak}
      aria-pressed={speaking}
    >
      {speaking ? (
        <Square size={16} aria-hidden="true" />
      ) : (
        <Volume2 size={16} aria-hidden="true" />
      )}
      <span>{speaking ? l.stop : l.speak}</span>
    </button>
  );
}
