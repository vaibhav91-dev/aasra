"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { locales, type Language } from "./i18n";

export interface SpeechSynthesisHook {
  supported: boolean;
  speaking: boolean;
  speak: (text: string, lang: Language) => void;
  stop: () => void;
}

const emptySubscribe = () => () => {};
const checkSpeechSupport = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;
const serverSupport = () => false;

/**
 * Text-to-Speech hook for accessibility, empowering gig and informal
 * workers with lower literacy or hands-free requirements to listen to
 * guidance, document reviews, and grievance drafts.
 */
export function useSpeechSynthesis(): SpeechSynthesisHook {
  const supported = useSyncExternalStore(
    emptySubscribe,
    checkSpeechSupport,
    serverSupport,
  );
  const [speaking, setSpeaking] = useState(false);
  const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      activeUtterance.current = null;
    }
  }, []);

  const speak = useCallback(
    (text: string, lang: Language) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      if (!text.trim()) {
        setSpeaking(false);
        return;
      }

      // Clean markdown asterisks and hash marks for smoother voice reading
      const cleanText = text
        .replace(/[*#_`~>]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetLocale = locales[lang] ?? "en-IN";
      utterance.lang = targetLocale;
      utterance.rate = 0.95; // Slightly slower for clearer comprehension

      // Try selecting a matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(targetLocale.slice(0, 2).toLowerCase()),
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        activeUtterance.current = null;
      };
      utterance.onerror = () => {
        setSpeaking(false);
        activeUtterance.current = null;
      };

      activeUtterance.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  return { supported, speaking, speak, stop };
}
