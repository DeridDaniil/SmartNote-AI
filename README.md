# SmartNote AI

**SmartNote AI is a local-first AI workspace for students and writers/copywriters.**

A focused tool for working with text. Core loop:

> paste text → choose a mode → get a result → refine → copy / export

The interface is **bilingual (RU / EN)** with a visible language switch in the header.

## Who it's for

- **students** — lectures, articles, summaries, essay outlines, self-check questions;
- **writers / copywriters** — rewriting, structure, shortening, polished copy;
- anyone working with lectures, articles, drafts, and posts.

## Features

**6 AI modes:**

| Mode | id | What it does |
| --- | --- | --- |
| Summary | `summary` | A short, clear summary |
| Key points | `keyPoints` | Main ideas as a list |
| Rewrite | `rewrite` | Cleaner and clearer, same meaning |
| Outline | `outline` | A structured outline of the material |
| Questions | `quiz` | Self-check questions and answers |
| Polished copy | `copyPolish` | Prepares the text for publishing |

Also:

- **streaming generation** of the answer in real time;
- **bilingual UI (RU / EN)** — switch in the header, persisted to `localStorage`;
- **local history** in `localStorage`;
- **quick actions** (shorter / simpler / academic / outline / questions) that drop the result back into the composer with the right mode;
- **copy** the result;
- **export to Markdown** (`.md`) and **TXT** (`.txt`);
- **mobile history** via a slide-in drawer;
- **simple settings**: interface language, AI answer language (Auto / RU / EN), and answer format (List / Structured / Plain);
- light, reduced-motion-aware micro-animations.

### UI language vs AI answer language

These are **two separate settings**:

- **Interface language** (header toggle / Settings) — changes the app's buttons and labels only. RU or EN.
- **Answer language** (Settings) — controls the language of the AI's answers: `Auto` (follows your text, Russian by default), `RU`, or `EN`. It is sent to the prompt and does **not** change the interface.

## Privacy / local-first

- **no account required** — the main flow is fully anonymous;
- **history stays local** — kept in the browser's `localStorage`, not in the cloud;
- text is sent to the app's server function and on to the AI provider **only** to generate a response; the app does not store it on the server;
- **don't enter sensitive data** (passwords, documents, banking/medical info);
- AI answers may be inaccurate — review them.

## Tech stack

React · TypeScript · Vite · Tailwind CSS · Zustand · React Markdown · Google Gemini API (`gemini-2.5-flash`).

## Environment

Only one variable is required:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

`GEMINI_API_KEY` is server-only (read in `api/generate*.ts`). Never rename it to a `VITE_*` variant — Vite inlines `VITE_*` vars into the client bundle.

## Setup

```bash
npm install
cp .env.example .env
# add your key to .env:
# GEMINI_API_KEY=your_real_key_here
npm run dev
```

The dev server (http://localhost:5173) proxies `/api/generate` and `/api/generate-stream` to the same handlers used in production — no separate API process needed.

## Scripts

```bash
npm run dev        # Vite dev server (+ /api/* proxy)
npm run typecheck  # tsc -b --noEmit
npm run build      # tsc -b && vite build → dist/
npm run preview    # preview the production build
```

## Deployment

Deploys to **Vercel** (Vite frontend + serverless functions in `api/`) or any platform that supports Vite + serverless API routes. Set `GEMINI_API_KEY` in the platform's environment variables.

## Security notes

- **Never commit `.env`** — it (and `.env.*`) is gitignored, except `.env.example`, which holds placeholders only.
- **Don't enter sensitive data** — text is sent to the AI provider for generation and is outside the app's control afterwards.
- **History is local** — stored in the browser; the app does not persist it server-side.
- Markdown is rendered safely: `react-markdown` + `remark-gfm`, no `rehype-raw`, no `dangerouslySetInnerHTML` (raw HTML from the AI is not executed). Keep it that way.
- API: POST-only, validates `text` / `mode` / `options` (whitelist), 12,000-char and 64 KiB limits, generic errors. User text and AI output are not logged server-side.

## Out of scope

Intentionally **not** part of this product: accounts, Supabase, Pro/billing, cloud sync, and integrations (Gmail / Google Docs / Notion). It's a focused local-first tool.

---

### Кратко (RU)

SmartNote AI — local-first AI-инструмент для студентов и авторов: вставьте текст, выберите сценарий в поле ввода и получите конспект, план, вопросы или чистовую версию. Интерфейс на двух языках (RU / EN, переключатель в шапке), история хранится локально в браузере, аккаунт не нужен. Язык интерфейса и язык ответа AI настраиваются отдельно.
