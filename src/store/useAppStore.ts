import { create } from "zustand";
import type {
  AIMode,
  AnswerFormat,
  AnswerLanguage,
  ChatMessage,
  HistoryItem,
  RequestStatus,
  UiLanguage,
} from "@/types";
import { generateStream } from "@/lib/apiClient";
import { getStrings } from "@/lib/i18n";
import {
  ANONYMOUS_DAILY_LIMIT,
  HISTORY_LIMIT,
  HISTORY_STORAGE_KEY,
  MAX_INPUT_LENGTH,
  SETTINGS_STORAGE_KEY,
  UI_LANGUAGE_STORAGE_KEY,
  USAGE_STORAGE_KEY,
} from "@/lib/constants";

// Re-exported so settings UI can import option types from the store.
export type { AnswerLanguage, AnswerFormat, UiLanguage } from "@/types";

export type AppView = "app" | "privacy" | "terms" | "settings";

export interface AppSettings {
  answerLanguage: AnswerLanguage;
  answerFormat: AnswerFormat;
}

const DEFAULT_SETTINGS: AppSettings = {
  answerLanguage: "auto",
  answerFormat: "structured",
};

const createId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const isValidMode = (value: unknown): value is AIMode =>
  value === "summary" ||
  value === "rewrite" ||
  value === "keyPoints" ||
  value === "quiz" ||
  value === "outline" ||
  value === "copyPolish";

const isHistoryItem = (value: unknown): value is HistoryItem => {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    isValidMode(v.mode) &&
    typeof v.inputText === "string" &&
    typeof v.resultText === "string" &&
    typeof v.createdAt === "string" &&
    typeof v.title === "string" &&
    typeof v.preview === "string"
  );
};

const loadHistory = (): HistoryItem[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryItem).slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
};

const saveHistory = (history: HistoryItem[]): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore quota / serialization errors
  }
};

const clearStoredHistory = (): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // ignore
  }
};

const getTodayString = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

interface StoredUsage {
  date: string;
  count: number;
}

const isStoredUsage = (value: unknown): value is StoredUsage => {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.date === "string" &&
    typeof v.count === "number" &&
    Number.isFinite(v.count) &&
    v.count >= 0
  );
};

const loadTodayUsage = (): number => {
  if (!isBrowser()) return 0;
  const today = getTodayString();
  try {
    const raw = window.localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredUsage(parsed)) return 0;
    if (parsed.date !== today) {
      const reset: StoredUsage = { date: today, count: 0 };
      window.localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(reset));
      return 0;
    }
    return parsed.count;
  } catch {
    return 0;
  }
};

const saveTodayUsage = (count: number): void => {
  if (!isBrowser()) return;
  try {
    const data: StoredUsage = { date: getTodayString(), count };
    window.localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / serialization errors
  }
};

const isAnswerLanguage = (v: unknown): v is AnswerLanguage =>
  v === "auto" || v === "ru" || v === "en";

const isAnswerFormat = (v: unknown): v is AnswerFormat =>
  v === "list" || v === "structured" || v === "plain";

const loadSettings = (): AppSettings => {
  if (!isBrowser()) return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      answerLanguage: isAnswerLanguage(parsed.answerLanguage)
        ? parsed.answerLanguage
        : DEFAULT_SETTINGS.answerLanguage,
      answerFormat: isAnswerFormat(parsed.answerFormat)
        ? parsed.answerFormat
        : DEFAULT_SETTINGS.answerFormat,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

const saveSettings = (settings: AppSettings): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings),
    );
  } catch {
    // ignore quota / serialization errors
  }
};

const detectDefaultUiLanguage = (): UiLanguage => {
  if (typeof navigator === "undefined") return "ru";
  return navigator.language?.toLowerCase().startsWith("ru") ? "ru" : "en";
};

const loadUiLanguage = (): UiLanguage => {
  if (!isBrowser()) return "ru";
  try {
    const raw = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
    if (raw === "ru" || raw === "en") return raw;
  } catch {
    // ignore
  }
  return detectDefaultUiLanguage();
};

const saveUiLanguage = (language: UiLanguage): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // ignore
  }
};

const buildTitle = (input: string): string => {
  const trimmed = input.trim();
  // Never reached in practice (submit requires non-empty input); kept neutral.
  if (!trimmed) return "—";
  const oneLine = trimmed.replace(/\s+/g, " ");
  return oneLine.length > 50 ? `${oneLine.slice(0, 50).trimEnd()}…` : oneLine;
};

const buildPreview = (result: string): string => {
  const trimmed = result.trim();
  if (!trimmed) return "";
  const oneLine = trimmed.replace(/\s+/g, " ");
  return oneLine.length > 100
    ? `${oneLine.slice(0, 100).trimEnd()}…`
    : oneLine;
};

const parseHashView = (hash: string): AppView => {
  const clean = hash.replace(/^#\/?/, "").trim().toLowerCase();
  if (clean === "privacy") return "privacy";
  if (clean === "terms") return "terms";
  if (clean === "settings") return "settings";
  // "profile" intentionally falls through to "app" — the profile page is not
  // part of the local-first MVP UX (the route stays dormant in the codebase).
  return "app";
};

const readInitialView = (): AppView => {
  if (typeof window === "undefined") return "app";
  return parseHashView(window.location.hash);
};

interface AppState {
  mode: AIMode;
  input: string;
  isSidebarOpen: boolean;
  messages: ChatMessage[];
  status: RequestStatus;
  error: string | null;
  history: HistoryItem[];
  requestCount: number;
  view: AppView;
  isHelpOpen: boolean;
  isMobileSidebarOpen: boolean;
  settings: AppSettings;
  uiLanguage: UiLanguage;
  composerFocusTick: number;

  setMode: (mode: AIMode) => void;
  setUiLanguage: (language: UiLanguage) => void;
  setInput: (value: string) => void;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setAnswerLanguage: (value: AnswerLanguage) => void;
  setAnswerFormat: (value: AnswerFormat) => void;
  prefillComposer: (text: string, mode: AIMode) => void;
  resetInput: () => void;
  setStatus: (status: RequestStatus) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearCurrentMessages: () => void;
  resetWorkspace: () => void;
  submitRequest: () => Promise<void>;
  clearHistory: () => void;
  restoreHistoryItem: (id: string) => void;
  navigate: (view: AppView) => void;
  setViewFromHash: () => void;
  openHelp: () => void;
  closeHelp: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: "summary",
  input: "",
  isSidebarOpen: true,
  messages: [],
  status: "idle",
  error: null,
  history: loadHistory(),
  requestCount: loadTodayUsage(),
  view: readInitialView(),
  isHelpOpen: false,
  isMobileSidebarOpen: false,
  settings: loadSettings(),
  uiLanguage: loadUiLanguage(),
  composerFocusTick: 0,

  setMode: (mode) => set({ mode }),
  setUiLanguage: (uiLanguage) => {
    saveUiLanguage(uiLanguage);
    set({ uiLanguage });
  },
  setInput: (input) =>
    set((state) =>
      state.status === "error"
        ? { input, error: null, status: "idle" }
        : { input },
    ),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  setAnswerLanguage: (answerLanguage) =>
    set((state) => {
      const settings = { ...state.settings, answerLanguage };
      saveSettings(settings);
      return { settings };
    }),
  setAnswerFormat: (answerFormat) =>
    set((state) => {
      const settings = { ...state.settings, answerFormat };
      saveSettings(settings);
      return { settings };
    }),
  prefillComposer: (text, mode) => {
    set((state) => ({
      input: text,
      mode,
      status: state.status === "error" ? "idle" : state.status,
      error: null,
      composerFocusTick: state.composerFocusTick + 1,
    }));
  },
  resetInput: () => set({ input: "" }),

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: error ? "error" : get().status }),
  clearError: () => set({ error: null }),
  clearCurrentMessages: () =>
    set({ messages: [], status: "idle", error: null }),
  resetWorkspace: () =>
    set({
      input: "",
      messages: [],
      status: "idle",
      error: null,
    }),

  submitRequest: async () => {
    const { input, mode, status, requestCount, settings, uiLanguage } = get();
    if (status === "loading") return;
    const t = getStrings(uiLanguage).errors;

    const trimmed = input.trim();
    if (!trimmed) return;

    if (input.length > MAX_INPUT_LENGTH) {
      set({ status: "error", error: t.tooLong });
      return;
    }

    // Local-first, no accounts: everyone shares a single gentle demo limit.
    if (requestCount >= ANONYMOUS_DAILY_LIMIT) {
      set({ status: "error", error: t.limitReached });
      return;
    }

    const nowIso = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
      createdAt: nowIso,
    };
    const assistantId = createId();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: nowIso,
    };

    set((state) => ({
      messages: [...state.messages, userMessage, assistantMessage],
      status: "loading",
      error: null,
      input: "",
    }));

    try {
      const result = await generateStream(
        trimmed,
        mode,
        (chunk) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunk }
                : m,
            ),
          }));
        },
        { language: settings.answerLanguage, format: settings.answerFormat },
      );

      // Local-first: history always lives in localStorage.
      const historyItem: HistoryItem = {
        id: createId(),
        mode,
        inputText: trimmed,
        resultText: result,
        createdAt: new Date().toISOString(),
        title: buildTitle(trimmed),
        preview: buildPreview(result),
      };
      set((state) => {
        const nextHistory = [historyItem, ...state.history].slice(
          0,
          HISTORY_LIMIT,
        );
        saveHistory(nextHistory);
        const nextCount = state.requestCount + 1;
        saveTodayUsage(nextCount);
        return {
          status: "success",
          error: null,
          requestCount: nextCount,
          history: nextHistory,
        };
      });
    } catch {
      // Drop the partial assistant bubble so the UI shows only the error banner.
      // Use a localized generic message rather than the (Russian) upstream text.
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== assistantId),
        status: "error",
        error: t.generic,
      }));
    }
  },

  clearHistory: () => {
    clearStoredHistory();
    set({ history: [] });
  },

  restoreHistoryItem: (id) => {
    const item = get().history.find((h) => h.id === id);
    if (!item) return;
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: item.inputText,
      createdAt: item.createdAt,
    };
    const assistantMessage: ChatMessage = {
      id: createId(),
      role: "assistant",
      content: item.resultText,
      createdAt: item.createdAt,
    };
    set({
      mode: item.mode,
      input: item.inputText,
      messages: [userMessage, assistantMessage],
      status: "success",
      error: null,
    });
  },

  navigate: (view) => {
    if (typeof window !== "undefined") {
      const hash =
        view === "privacy"
          ? "#/privacy"
          : view === "terms"
            ? "#/terms"
            : view === "settings"
              ? "#/settings"
              : "#/";
      if (window.location.hash !== hash) {
        window.location.hash = hash;
      }
    }
    set({ view });
  },

  setViewFromHash: () => {
    if (typeof window === "undefined") return;
    set({ view: parseHashView(window.location.hash) });
  },

  openHelp: () => set({ isHelpOpen: true }),
  closeHelp: () => set({ isHelpOpen: false }),
}));
