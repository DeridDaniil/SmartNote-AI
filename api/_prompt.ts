// Shared prompt directives for both generate.ts and generate-stream.ts.
// Answer options come from the client but are strictly whitelisted here — only
// a fixed set of directive strings can ever reach the model (no free text).

export const LANGUAGE_DIRECTIVE =
  "Отвечай на русском языке, если пользователь явно не попросил другой язык.";

type AnswerLanguage = "auto" | "ru" | "en";
type AnswerFormat = "list" | "structured" | "plain";

export interface AnswerOptions {
  language?: AnswerLanguage;
  format?: AnswerFormat;
}

const LANGUAGES: AnswerLanguage[] = ["auto", "ru", "en"];
const FORMATS: AnswerFormat[] = ["list", "structured", "plain"];

/** Accept only known enum values; everything else is dropped. */
export const parseOptions = (raw: unknown): AnswerOptions => {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const options: AnswerOptions = {};
  if (LANGUAGES.includes(r.language as AnswerLanguage)) {
    options.language = r.language as AnswerLanguage;
  }
  if (FORMATS.includes(r.format as AnswerFormat)) {
    options.format = r.format as AnswerFormat;
  }
  return options;
};

export const buildDirectives = (
  options: AnswerOptions,
  defaultLanguageDirective: string,
): string => {
  const lines: string[] = [];

  if (options.language === "en") {
    lines.push("Always answer in English, regardless of the input language.");
  } else if (options.language === "ru") {
    lines.push("Отвечай на русском языке.");
  } else {
    lines.push(defaultLanguageDirective);
  }

  if (options.format === "list") {
    lines.push(
      "Оформи ответ преимущественно в виде маркированного списка, где это уместно.",
    );
  } else if (options.format === "plain") {
    lines.push(
      "Дай ответ обычным связным текстом, без списков и заголовков, если это уместно.",
    );
  } else if (options.format === "structured") {
    lines.push(
      "Структурируй ответ: используй короткие подзаголовки и списки, где это уместно.",
    );
  }

  return lines.join("\n");
};
