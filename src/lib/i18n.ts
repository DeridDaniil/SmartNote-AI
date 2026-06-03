import type { AIMode, UiLanguage } from "@/types";

interface ModeStrings {
  label: string;
  description: string;
}

interface LegalSection {
  title: string;
  body: string[];
}

export interface Strings {
  header: {
    brand: string;
    brandTag: string;
    historyAria: string;
    help: string;
    settings: string;
    languageAria: string;
  };
  sidebar: {
    brandTag: string;
    newText: string;
    recent: string;
    clearHistory: string;
    emptyTitle: string;
    emptyHint: string;
    privacy: string;
    terms: string;
    copyright: string;
  };
  hero: {
    tag: string;
    headline: string;
    subtitle: string;
    privacyNote: string;
    badges: string[];
  };
  composer: {
    placeholderHero: string;
    placeholderCompact: string;
    inputAria: string;
    modeAria: string;
    modeFallback: string;
    send: string;
    generating: string;
    charLimit: (formatted: string) => string;
  };
  modes: Record<AIMode, ModeStrings>;
  result: {
    emptyTitle: string;
    emptyHint: string;
    copy: string;
    exportMd: string;
    exportTxt: string;
    copyAria: string;
    exportMdAria: string;
    exportTxtAria: string;
    copied: string;
    saved: string;
    copyFailed: string;
    exportFailed: string;
    you: string;
    assistant: string;
    generating: string;
    errorTitle: string;
    exportHeading: string;
    exportModeLabel: string;
  };
  quickActions: {
    heading: string;
    items: Record<
      "shorter" | "simpler" | "academic" | "outline" | "questions",
      { label: string; prompt: string }
    >;
  };
  settings: {
    tag: string;
    title: string;
    subtitle: string;
    uiLanguage: string;
    uiLanguageHint: string;
    answerLanguage: string;
    answerLanguageHint: string;
    answerFormat: string;
    answerFormatHint: string;
    formatList: string;
    formatStructured: string;
    formatPlain: string;
    localData: string;
    localDataDesc: (count: number) => string;
    clearHistory: string;
    cleared: string;
    about: string;
    aboutDesc: string;
  };
  help: {
    title: string;
    subtitle: string;
    close: string;
    whatTitle: string;
    whatBody: string;
    howTitle: string;
    howSteps: string[];
    modesTitle: string;
    quickTitle: string;
    quickBody: string;
    localTitle: string;
    localBody: string[];
    safetyTitle: string;
    safetyBody: string[];
  };
  legal: {
    back: string;
    updated: string;
    docTag: string;
    privacyTitle: string;
    privacySections: LegalSection[];
    termsTitle: string;
    termsSections: LegalSection[];
  };
  errors: {
    tooLong: string;
    limitReached: string;
    generic: string;
  };
}

const ru: Strings = {
  header: {
    brand: "SmartNote AI",
    brandTag: "рабочая область",
    historyAria: "История",
    help: "Помощь",
    settings: "Настройки",
    languageAria: "Язык интерфейса",
  },
  sidebar: {
    brandTag: "local-first",
    newText: "Новый текст",
    recent: "Недавние",
    clearHistory: "Очистить историю",
    emptyTitle: "Здесь появятся ваши тексты",
    emptyHint:
      "После первого запроса результат сохранится локально, в этом браузере.",
    privacy: "Конфиденциальность",
    terms: "Условия",
    copyright: "© 2026 SmartNote AI",
  },
  hero: {
    tag: "Local-first AI workspace",
    headline: "Превращайте черновики, лекции и статьи в готовые тексты",
    subtitle:
      "Вставьте материал, выберите сценарий в поле ввода и получите конспект, план, вопросы для самопроверки или чистовую версию текста.",
    privacyNote:
      "История хранится в вашем браузере. Текст отправляется только для генерации ответа.",
    badges: [
      "Для лекций, статей, черновиков и постов",
      "Конспект, план, вопросы или чистовая версия",
      "История хранится локально",
    ],
  },
  composer: {
    placeholderHero: "Вставьте лекцию, статью, черновик или пост…",
    placeholderCompact: "Вставьте следующий текст…",
    inputAria: "Поле ввода",
    modeAria: "Выбрать сценарий",
    modeFallback: "Сценарий",
    send: "Сгенерировать",
    generating: "Идёт генерация",
    charLimit: (formatted) => `Лимит: ${formatted} символов`,
  },
  modes: {
    summary: {
      label: "Конспект",
      description: "Краткое понятное резюме текста",
    },
    keyPoints: {
      label: "Главные мысли",
      description: "Ключевые идеи и выводы списком",
    },
    rewrite: {
      label: "Переписать",
      description: "Чище и яснее без потери смысла",
    },
    outline: {
      label: "План",
      description: "Структурированный план материала",
    },
    quiz: {
      label: "Вопросы",
      description: "Вопросы и ответы для самопроверки",
    },
    copyPolish: {
      label: "Чистовой текст",
      description: "Готовит текст к публикации",
    },
  },
  result: {
    emptyTitle: "Здесь появится результат",
    emptyHint:
      "Вставьте текст, выберите сценарий в поле ввода и нажмите отправку.",
    copy: "Скопировать",
    exportMd: "Экспорт MD",
    exportTxt: "Экспорт TXT",
    copyAria: "Скопировать последний результат",
    exportMdAria: "Экспортировать результат в Markdown",
    exportTxtAria: "Экспортировать результат в TXT",
    copied: "Скопировано",
    saved: "Файл сохранён",
    copyFailed: "Не удалось скопировать. Попробуйте ещё раз.",
    exportFailed: "Не удалось экспортировать. Попробуйте ещё раз.",
    you: "Вы",
    assistant: "SmartNote",
    generating: "Генерация",
    errorTitle: "Не удалось сгенерировать ответ",
    exportHeading: "Результат SmartNote AI",
    exportModeLabel: "Сценарий",
  },
  quickActions: {
    heading: "Доработать результат",
    items: {
      shorter: {
        label: "Сделать короче",
        prompt: "Сделай этот текст короче:",
      },
      simpler: {
        label: "Сделать проще",
        prompt: "Объясни проще и яснее:",
      },
      academic: {
        label: "Сделать академичнее",
        prompt: "Перепиши в более академическом стиле:",
      },
      outline: {
        label: "Сделать план",
        prompt: "Сделай структурированный план по этому тексту:",
      },
      questions: {
        label: "Создать вопросы",
        prompt: "Создай вопросы для самопроверки по этому тексту:",
      },
    },
  },
  settings: {
    tag: "Настройки",
    title: "Параметры",
    subtitle:
      "Лёгкие настройки под ваш сценарий. Всё хранится локально, в этом браузере.",
    uiLanguage: "Язык интерфейса",
    uiLanguageHint: "Язык кнопок и подписей приложения.",
    answerLanguage: "Язык ответа",
    answerLanguageHint:
      "Язык ответов AI. «Auto» — язык вашего текста (по умолчанию русский).",
    answerFormat: "Формат ответа",
    answerFormatHint: "Подсказка модели, как структурировать результат.",
    formatList: "Список",
    formatStructured: "Структура",
    formatPlain: "Обычный текст",
    localData: "Локальные данные",
    localDataDesc: (count) =>
      `История запросов хранится только в вашем браузере (localStorage).${
        count > 0 ? ` Сейчас сохранено записей: ${count}.` : ""
      }`,
    clearHistory: "Очистить локальную историю",
    cleared: "История очищена.",
    about: "О демо",
    aboutDesc:
      "SmartNote AI — демо-инструмент. История хранится в браузере. Текст отправляется только для генерации ответа и не сохраняется на сервере. Аккаунт не требуется.",
  },
  help: {
    title: "Справка",
    subtitle: "Короткое руководство по SmartNote AI",
    close: "Закрыть",
    whatTitle: "Что делает SmartNote AI",
    whatBody:
      "Вставьте лекцию, статью, черновик или пост — выберите сценарий и получите готовый результат, который можно доработать, скопировать или экспортировать.",
    howTitle: "Как пользоваться",
    howSteps: [
      "Вставьте или напечатайте текст в поле ввода.",
      "Выберите сценарий в поле ввода (кнопка режима).",
      "Нажмите Enter или кнопку отправки.",
      "Доработайте результат быстрыми действиями, затем скопируйте или экспортируйте в Markdown / TXT.",
    ],
    modesTitle: "Какие есть режимы",
    quickTitle: "Быстрые действия",
    quickBody:
      "Под готовым результатом есть быстрые действия (короче, проще, академичнее, план, вопросы). Они подставляют результат в поле ввода с подходящим режимом — останется нажать отправку.",
    localTitle: "Что хранится локально",
    localBody: [
      "История хранится в localStorage этого браузера. Аккаунт не нужен.",
      "Результат можно скопировать или экспортировать в Markdown (.md) либо TXT (.txt).",
      "Очистить историю можно в боковой панели или в «Настройках».",
    ],
    safetyTitle: "Что происходит с текстом",
    safetyBody: [
      "Текст отправляется на серверную функцию и далее в Google Gemini только для генерации ответа. На сервере он не сохраняется.",
      "Не вводите пароли, документы, банковские или медицинские данные.",
      "До 12 000 символов в одном запросе. AI-ответы стоит проверять.",
    ],
  },
  legal: {
    back: "← Вернуться на главную",
    updated: "Обновлено: 03.06.2026",
    docTag: "Документ",
    privacyTitle: "Политика конфиденциальности",
    privacySections: [
      {
        title: "1. Что это",
        body: [
          "SmartNote AI — демонстрационный local-first AI-инструмент для работы с текстом. Аккаунт не требуется: основной сценарий работает анонимно.",
        ],
      },
      {
        title: "2. История хранится локально",
        body: [
          "История запросов и результатов хранится только в вашем браузере (localStorage). В текущей версии приложение не сохраняет введённый текст и историю на сервере.",
          "Очистить историю можно в любой момент — в боковой панели, в «Настройках» или средствами браузера.",
        ],
      },
      {
        title: "3. Передача текста AI-провайдеру",
        body: [
          "Для генерации ответа текст отправляется на серверную функцию приложения и далее AI-провайдеру (Google Gemini) — только для генерации.",
          "Абсолютная приватность не гарантируется: обработка запроса провайдером необходима для ответа. Администратор не контролирует политику провайдера.",
        ],
      },
      {
        title: "4. Чувствительные данные",
        body: [
          "Не вводите пароли, паспортные данные, банковские реквизиты, медицинские записи и другую чувствительную информацию.",
          "AI-ответы могут быть неточными — проверяйте важные сведения самостоятельно.",
        ],
      },
    ],
    termsTitle: "Условия использования",
    termsSections: [
      {
        title: "1. О сервисе",
        body: [
          "SmartNote AI — демонстрационный local-first AI-инструмент. Нет аккаунтов, оплаты, Pro и подписок. Сервис предоставляется «как есть».",
        ],
      },
      {
        title: "2. Ограничения",
        body: [
          "До 12 000 символов в одном запросе. Действует щадящий демо-лимит запросов в день. Запрещены автоматизированные злоупотребления и избыточная нагрузка.",
        ],
      },
      {
        title: "3. Ответственность пользователя",
        body: [
          "Вы отвечаете за вводимый текст и за использование результатов. Не вводите конфиденциальные данные и подтверждаете, что обладаете правами на текст.",
          "AI-ответы могут содержать ошибки — проверяйте их перед использованием. Сервис не заменяет профессиональную консультацию.",
        ],
      },
    ],
  },
  errors: {
    tooLong:
      "Текст слишком длинный. Пожалуйста, не превышайте 12 000 символов.",
    limitReached:
      "Демо-лимит на сегодня исчерпан. Попробуйте завтра или запустите проект локально со своим API-ключом.",
    generic: "Не удалось сгенерировать ответ. Попробуйте ещё раз.",
  },
};

const en: Strings = {
  header: {
    brand: "SmartNote AI",
    brandTag: "workspace",
    historyAria: "History",
    help: "Help",
    settings: "Settings",
    languageAria: "Interface language",
  },
  sidebar: {
    brandTag: "local-first",
    newText: "New text",
    recent: "Recent",
    clearHistory: "Clear history",
    emptyTitle: "Your texts will appear here",
    emptyHint:
      "After your first request, the result is saved locally, in this browser.",
    privacy: "Privacy",
    terms: "Terms",
    copyright: "© 2026 SmartNote AI",
  },
  hero: {
    tag: "Local-first AI workspace",
    headline: "Turn drafts, lectures, and articles into ready-to-use text",
    subtitle:
      "Paste your material, choose a mode in the composer, and get a summary, outline, study questions, or polished copy.",
    privacyNote:
      "Your history stays in this browser. Text is sent only to generate a response.",
    badges: [
      "For lectures, articles, drafts, and posts",
      "Summary, outline, questions, or polished copy",
      "History stays local",
    ],
  },
  composer: {
    placeholderHero: "Paste a lecture, article, draft, or post…",
    placeholderCompact: "Paste the next text…",
    inputAria: "Input field",
    modeAria: "Choose a mode",
    modeFallback: "Mode",
    send: "Generate",
    generating: "Generating",
    charLimit: (formatted) => `Limit: ${formatted} characters`,
  },
  modes: {
    summary: {
      label: "Summary",
      description: "A short, clear summary of the text",
    },
    keyPoints: {
      label: "Key points",
      description: "Main ideas and takeaways as a list",
    },
    rewrite: {
      label: "Rewrite",
      description: "Cleaner and clearer, same meaning",
    },
    outline: {
      label: "Outline",
      description: "A structured outline of the material",
    },
    quiz: {
      label: "Questions",
      description: "Self-check questions and answers",
    },
    copyPolish: {
      label: "Polished copy",
      description: "Prepares the text for publishing",
    },
  },
  result: {
    emptyTitle: "Your result will appear here",
    emptyHint: "Paste text, pick a mode in the composer, and hit send.",
    copy: "Copy",
    exportMd: "Export MD",
    exportTxt: "Export TXT",
    copyAria: "Copy the latest result",
    exportMdAria: "Export the result as Markdown",
    exportTxtAria: "Export the result as TXT",
    copied: "Copied",
    saved: "File saved",
    copyFailed: "Couldn't copy. Please try again.",
    exportFailed: "Couldn't export. Please try again.",
    you: "You",
    assistant: "SmartNote",
    generating: "Generating",
    errorTitle: "Couldn't generate a response",
    exportHeading: "SmartNote AI result",
    exportModeLabel: "Mode",
  },
  quickActions: {
    heading: "Refine the result",
    items: {
      shorter: {
        label: "Make shorter",
        prompt: "Make this text shorter:",
      },
      simpler: {
        label: "Make simpler",
        prompt: "Explain this more simply and clearly:",
      },
      academic: {
        label: "Make academic",
        prompt: "Rewrite this in a more academic style:",
      },
      outline: {
        label: "Make an outline",
        prompt: "Create a structured outline based on this text:",
      },
      questions: {
        label: "Create questions",
        prompt: "Create study questions based on this text:",
      },
    },
  },
  settings: {
    tag: "Settings",
    title: "Preferences",
    subtitle:
      "Light settings for your workflow. Everything is stored locally, in this browser.",
    uiLanguage: "Interface language",
    uiLanguageHint: "Language of the app's buttons and labels.",
    answerLanguage: "Answer language",
    answerLanguageHint:
      "Language of AI answers. “Auto” follows your text (Russian by default).",
    answerFormat: "Answer format",
    answerFormatHint: "A hint to the model on how to structure the result.",
    formatList: "List",
    formatStructured: "Structured",
    formatPlain: "Plain text",
    localData: "Local data",
    localDataDesc: (count) =>
      `Request history is kept only in your browser (localStorage).${
        count > 0 ? ` Currently stored: ${count}.` : ""
      }`,
    clearHistory: "Clear local history",
    cleared: "History cleared.",
    about: "About this demo",
    aboutDesc:
      "SmartNote AI is a demo tool. History is kept in your browser. Text is sent only to generate a response and is not stored on the server. No account required.",
  },
  help: {
    title: "Help",
    subtitle: "A short guide to SmartNote AI",
    close: "Close",
    whatTitle: "What SmartNote AI does",
    whatBody:
      "Paste a lecture, article, draft, or post — choose a mode and get a ready result you can refine, copy, or export.",
    howTitle: "How to use it",
    howSteps: [
      "Paste or type your text into the composer.",
      "Choose a mode in the composer (the mode button).",
      "Press Enter or the send button.",
      "Refine the result with quick actions, then copy or export to Markdown / TXT.",
    ],
    modesTitle: "Available modes",
    quickTitle: "Quick actions",
    quickBody:
      "Below a finished result there are quick actions (shorter, simpler, academic, outline, questions). They drop the result into the composer with the right mode — just hit send.",
    localTitle: "What stays local",
    localBody: [
      "History stays in this browser's localStorage. No account needed.",
      "Results can be copied or exported to Markdown (.md) or TXT (.txt).",
      "Clear history from the sidebar or in Settings.",
    ],
    safetyTitle: "What happens to your text",
    safetyBody: [
      "Text is sent to the app's server function and on to Google Gemini only to generate a response. It is not stored on the server.",
      "Don't enter passwords, documents, or banking/medical data.",
      "Up to 12,000 characters per request. AI answers should be reviewed.",
    ],
  },
  legal: {
    back: "← Back to app",
    updated: "Updated: 2026-06-03",
    docTag: "Document",
    privacyTitle: "Privacy Policy",
    privacySections: [
      {
        title: "1. What this is",
        body: [
          "SmartNote AI is a demo, local-first AI tool for working with text. No account is required — the main flow works anonymously.",
        ],
      },
      {
        title: "2. History stays local",
        body: [
          "Your request history and results are kept only in your browser (localStorage). In this version the app does not store your text or history on the server.",
          "You can clear history at any time — from the sidebar, in Settings, or via your browser.",
        ],
      },
      {
        title: "3. Sending text to the AI provider",
        body: [
          "To generate a response, your text is sent to the app's server function and on to the AI provider (Google Gemini) — only for generation.",
          "Absolute privacy is not guaranteed: the provider must process the request to answer. We do not control the provider's policy.",
        ],
      },
      {
        title: "4. Sensitive data",
        body: [
          "Do not enter passwords, ID documents, banking details, medical records, or other sensitive information.",
          "AI answers may be inaccurate — verify important details yourself.",
        ],
      },
    ],
    termsTitle: "Terms of Use",
    termsSections: [
      {
        title: "1. About the service",
        body: [
          "SmartNote AI is a demo, local-first AI tool. There are no accounts, payments, Pro, or subscriptions. The service is provided “as is”.",
        ],
      },
      {
        title: "2. Limits",
        body: [
          "Up to 12,000 characters per request. A gentle daily demo limit applies. Automated abuse and excessive load are not allowed.",
        ],
      },
      {
        title: "3. Your responsibility",
        body: [
          "You are responsible for the text you submit and how you use the results. Don't enter confidential data, and you confirm you have the rights to the text.",
          "AI answers may contain errors — review them before use. The service is not a substitute for professional advice.",
        ],
      },
    ],
  },
  errors: {
    tooLong: "The text is too long. Please keep it under 12,000 characters.",
    limitReached:
      "You've reached today's demo limit. Try again tomorrow, or run the project locally with your own API key.",
    generic: "Couldn't generate a response. Please try again.",
  },
};

const TRANSLATIONS: Record<UiLanguage, Strings> = { ru, en };

export const getStrings = (language: UiLanguage): Strings =>
  TRANSLATIONS[language];
