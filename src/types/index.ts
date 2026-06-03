export type AIMode =
  | "summary"
  | "rewrite"
  | "keyPoints"
  | "quiz"
  | "outline"
  | "copyPolish";

export type ChatRole = "user" | "assistant";

export type RequestStatus = "idle" | "loading" | "success" | "error";

export interface AIModeOption {
  id: AIMode;
  label: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  mode: AIMode;
  inputText: string;
  resultText: string;
  createdAt: string;
  title: string;
  preview: string;
}

// UI language (interface chrome) — independent of the AI answer language.
export type UiLanguage = "ru" | "en";

// Answer settings (interface-level, passed through to the prompt).
export type AnswerLanguage = "auto" | "ru" | "en";
export type AnswerFormat = "list" | "structured" | "plain";

export interface GenerateOptions {
  language: AnswerLanguage;
  format: AnswerFormat;
}
