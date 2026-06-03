import type { AIMode } from "@/types";

// Display order of modes. Localized labels/descriptions live in src/lib/i18n.ts.
export const AI_MODE_ORDER: AIMode[] = [
  "summary",
  "keyPoints",
  "rewrite",
  "outline",
  "quiz",
  "copyPolish",
];

export const HISTORY_STORAGE_KEY = "smartnote-history";
export const HISTORY_LIMIT = 20;

export const USAGE_STORAGE_KEY = "smartnote-usage";
export const SETTINGS_STORAGE_KEY = "smartnote-settings";
export const UI_LANGUAGE_STORAGE_KEY = "smartnote-ui-language";

// Local-first demo: a gentle client-side guard. The server remains the real
// source of truth (see api/_security.ts ANONYMOUS_DAILY_LIMIT).
export const ANONYMOUS_DAILY_LIMIT = 10;

export const MAX_INPUT_LENGTH = 12000;
