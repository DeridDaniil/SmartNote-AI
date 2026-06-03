import {
  ANONYMOUS_DAILY_LIMIT,
  MAX_INPUT_LENGTH,
  checkBodySize,
  checkRateLimitWithLimit,
  fetchWithTimeout,
  isValidMode,
  json,
} from "./_security";
import { LANGUAGE_DIRECTIVE, buildDirectives, parseOptions } from "./_prompt";

type AIMode =
  | "summary"
  | "rewrite"
  | "keyPoints"
  | "quiz"
  | "outline"
  | "copyPolish";

const MODEL = "gemini-2.5-flash";

const PROMPT_BUILDERS: Record<AIMode, (input: string, directives: string) => string> = {
  summary: (input, directives) =>
    `Ты — SmartNote, ассистент, который делает краткие, структурированные резюме.

${directives}

Сделай краткое резюме исходного материала ниже простым и понятным языком. Начни с одного предложения-тезиса, затем добавь 3–5 коротких пунктов, которые сохраняют главные факты и логику. Не выдумывай детали, которых нет в исходном тексте.

Материал:
"""
${input}
"""`,
  rewrite: (input, directives) =>
    `Ты — SmartNote, редактор, который переписывает текст для ясности, сохраняя исходный смысл.

${directives}

Перепиши текст ниже так, чтобы он читался чисто и уверенно. Сохрани намерение автора, факты и тональность. Исправь грамматику, сделай формулировки точнее, убери повторы. Не добавляй новую информацию.

Материал:
"""
${input}
"""`,
  keyPoints: (input, directives) =>
    `Ты — SmartNote, ассистент, который выделяет главные идеи из исходного материала.

${directives}

Прочитай материал ниже и верни ключевые идеи в виде маркированного списка markdown. Каждый пункт — одна отдельная мысль в одном предложении. Сортируй пункты по важности. Не добавляй комментариев вне списка.

Материал:
"""
${input}
"""`,
  quiz: (input, directives) =>
    `Ты — SmartNote, наставник, который составляет вопросы для самопроверки по материалу.

${directives}

Сгенерируй 5 вопросов по материалу ниже. Сочетай вопросы на запоминание и на понимание. После всех вопросов добавь раздел «Ответы» с краткими ответами, основанными только на содержании материала.

Формат:
1. Вопрос
2. Вопрос
...

Ответы:
1. ...
2. ...

Материал:
"""
${input}
"""`,
  outline: (input, directives) =>
    `Ты — SmartNote, ассистент, который строит структурированные планы для эссе, статей и учебных материалов.

${directives}

Составь по тексту ниже понятный иерархический план. Выдели основные разделы как заголовки markdown, под каждым добавь 2–4 коротких подпункта. Сохрани смысл и логику исходного текста, не добавляй информацию, которой в нём нет. Если текст — черновик идеи, разверни его в полноценную структуру материала.

Материал:
"""
${input}
"""`,
  copyPolish: (input, directives) =>
    `Ты — SmartNote, опытный редактор, который готовит текст к публикации.

${directives}

Доведи текст ниже до чистового вида: сделай его яснее, выразительнее и приятнее для чтения. Улучши ритм, убери канцелярит, повторы и лишние слова, выровняй тон. Сохрани исходный смысл и факты, не добавляй неподтверждённых утверждений. Верни только готовый текст без пояснений.

Материал:
"""
${input}
"""`,
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Метод не поддерживается." }, 405);
  }

  const tooLarge = checkBodySize(request);
  if (tooLarge) return tooLarge;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[generate] GEMINI_API_KEY is not configured");
    return json(
      { error: "Сервис временно недоступен. Попробуйте позже." },
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Неверный формат запроса." }, 400);
  }

  if (!body || typeof body !== "object") {
    return json({ error: "Неверный формат запроса." }, 400);
  }

  const { text, mode, options } = body as {
    text?: unknown;
    mode?: unknown;
    options?: unknown;
  };

  if (typeof text !== "string" || text.trim().length === 0) {
    return json({ error: "Введите текст для обработки." }, 400);
  }

  if (text.length > MAX_INPUT_LENGTH) {
    return json(
      {
        error: `Текст слишком длинный. Пожалуйста, не превышайте ${MAX_INPUT_LENGTH.toLocaleString("ru-RU")} символов.`,
      },
      400,
    );
  }

  if (!isValidMode(mode)) {
    return json({ error: "Неизвестный режим." }, 400);
  }

  const ipRate = checkRateLimitWithLimit(request, ANONYMOUS_DAILY_LIMIT);
  if (!ipRate.ok) return ipRate.response;

  const directives = buildDirectives(parseOptions(options), LANGUAGE_DIRECTIVE);
  const prompt = PROMPT_BUILDERS[mode](text, directives);

  try {
    const upstream = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
          },
        }),
      },
    );

    if (!upstream.ok) {
      console.error(
        `[generate] Gemini request failed with status ${upstream.status}`,
      );
      return json(
        { error: "Не удалось сгенерировать ответ. Попробуйте ещё раз." },
        502,
      );
    }

    const data = (await upstream.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const result = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!result) {
      return json(
        { error: "AI вернул пустой ответ. Попробуйте ещё раз." },
        502,
      );
    }

    ipRate.commit();
    return json({ result }, 200);
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    console.error(
      "[generate] Upstream call threw:",
      err instanceof Error ? err.name : "unknown",
    );
    return json(
      {
        error: isAbort
          ? "Время ожидания ответа AI истекло. Попробуйте ещё раз."
          : "Не удалось сгенерировать ответ. Попробуйте ещё раз.",
      },
      isAbort ? 504 : 502,
    );
  }
}
