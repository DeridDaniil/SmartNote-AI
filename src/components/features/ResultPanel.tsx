import { useEffect, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import Button from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { useStrings } from "@/lib/useStrings";
import type { ChatMessage } from "@/types";

interface ResultPanelProps {
  modeLabel?: string;
}

type Feedback = { kind: "success" | "error"; text: string } | null;

const formatDateForFilename = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const buildExportContent = (
  content: string,
  heading: string,
  modeWord: string,
  modeLabel?: string,
): string => {
  const lines = [`# ${heading}`, ""];
  if (modeLabel) {
    lines.push(`**${modeWord}:** ${modeLabel}`, "");
  }
  lines.push(content);
  return lines.join("\n");
};

const copyToClipboard = async (text: string): Promise<void> => {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error("Clipboard API unavailable");
};

const downloadFile = (
  content: string,
  filename: string,
  mime: string,
): void => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
};

export default function ResultPanel({ modeLabel }: ResultPanelProps) {
  const messages = useAppStore((s) => s.messages);
  const status = useAppStore((s) => s.status);
  const error = useAppStore((s) => s.error);
  const t = useStrings();

  const isLoading = status === "loading";
  const isError = status === "error";

  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 2000);
    return () => window.clearTimeout(id);
  }, [feedback]);

  const latestAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  const handleCopy = async () => {
    if (!latestAssistant) return;
    try {
      await copyToClipboard(latestAssistant.content);
      setFeedback({ kind: "success", text: t.result.copied });
    } catch {
      setFeedback({ kind: "error", text: t.result.copyFailed });
    }
  };

  const handleExport = () => {
    if (!latestAssistant) return;
    try {
      const filename = `smartnote-${formatDateForFilename(new Date())}.md`;
      const content = buildExportContent(
        latestAssistant.content,
        t.result.exportHeading,
        t.result.exportModeLabel,
        modeLabel,
      );
      downloadFile(content, filename, "text/markdown;charset=utf-8");
      setFeedback({ kind: "success", text: t.result.saved });
    } catch {
      setFeedback({ kind: "error", text: t.result.exportFailed });
    }
  };

  const handleExportTxt = () => {
    if (!latestAssistant) return;
    try {
      const filename = `smartnote-${formatDateForFilename(new Date())}.txt`;
      // Plain text export: raw content without the markdown header wrapper.
      downloadFile(latestAssistant.content, filename, "text/plain;charset=utf-8");
      setFeedback({ kind: "success", text: t.result.saved });
    } catch {
      setFeedback({ kind: "error", text: t.result.exportFailed });
    }
  };

  if (messages.length === 0 && !isLoading && !isError) {
    return (
      <section className="rounded-xl2 border border-dashed border-border bg-muted/40 p-8 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface text-subtle shadow-ring">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4" />
            <path d="m16.24 7.76 2.83-2.83" />
            <path d="M18 12h4" />
            <path d="m16.24 16.24 2.83 2.83" />
            <path d="M12 18v4" />
            <path d="m4.93 19.07 2.83-2.83" />
            <path d="M2 12h4" />
            <path d="m4.93 4.93 2.83 2.83" />
          </svg>
        </div>
        <h3 className="mt-4 font-display text-2xl text-text">
          {t.result.emptyTitle}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-subtle">
          {t.result.emptyHint}
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl2 border border-border bg-surface p-5 shadow-soft">
      {(modeLabel || latestAssistant) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
            {modeLabel ?? ""}
          </span>
          {latestAssistant && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {feedback && (
                <span
                  role="status"
                  aria-live="polite"
                  className={
                    feedback.kind === "success"
                      ? "text-[12px] font-medium text-subtle"
                      : "text-[12px] font-medium text-red-600"
                  }
                >
                  {feedback.text}
                </span>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                disabled={isLoading}
                aria-label={t.result.copyAria}
              >
                {t.result.copy}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                disabled={isLoading}
                aria-label={t.result.exportMdAria}
              >
                {t.result.exportMd}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportTxt}
                disabled={isLoading}
                aria-label={t.result.exportTxtAria}
              >
                {t.result.exportTxt}
              </Button>
            </div>
          )}
        </div>
      )}
      <ul className="flex flex-col gap-3">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            youLabel={t.result.you}
            assistantLabel={t.result.assistant}
          />
        ))}
        {isLoading && !latestAssistant && (
          <LoadingBubble
            assistantLabel={t.result.assistant}
            generatingLabel={t.result.generating}
          />
        )}
      </ul>
      {isError && error && (
        <ErrorBanner title={t.result.errorTitle} message={error} />
      )}
    </section>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-3 mb-2 font-display text-xl text-text first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 mb-2 font-display text-lg text-text first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-3 mb-1.5 text-[15px] font-semibold text-text first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-2 mb-1 text-[14px] font-semibold text-text first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-2 first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 first:mt-0 last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-text">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-subtle first:mt-0 last:mb-0">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-text underline decoration-subtle underline-offset-2 hover:decoration-text"
    >
      {children}
    </a>
  ),
  code: ({ className, children, node: _node, ...props }) => {
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return (
        <code
          className="block whitespace-pre font-mono text-[13px] leading-relaxed text-text"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-accent-soft px-1 py-0.5 font-mono text-[12.5px] text-text"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-muted/60 p-3 first:mt-0 last:mb-0">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-3 border-border" />,
};

function MessageBubble({
  message,
  youLabel,
  assistantLabel,
}: {
  message: ChatMessage;
  youLabel: string;
  assistantLabel: string;
}) {
  const isUser = message.role === "user";
  return (
    <li
      className={
        isUser
          ? "rounded-xl border border-border bg-muted/60 px-4 py-3"
          : "rounded-xl border border-border bg-muted/30 px-4 py-3"
      }
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
          {isUser ? youLabel : assistantLabel}
        </span>
      </div>
      {isUser ? (
        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-text">
          {message.content}
        </p>
      ) : (
        <div className="text-[14px] leading-relaxed text-text">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {message.content ?? ""}
          </ReactMarkdown>
        </div>
      )}
    </li>
  );
}

function LoadingBubble({
  assistantLabel,
  generatingLabel,
}: {
  assistantLabel: string;
  generatingLabel: string;
}) {
  return (
    <li
      className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3"
      aria-live="polite"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
          {assistantLabel}
        </span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-subtle">
          {generatingLabel}
        </span>
      </div>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-subtle/70 motion-safe:animate-bounce [animation-delay:-300ms]" />
        <span className="h-2 w-2 rounded-full bg-subtle/70 motion-safe:animate-bounce [animation-delay:-150ms]" />
        <span className="h-2 w-2 rounded-full bg-subtle/70 motion-safe:animate-bounce" />
      </div>
    </li>
  );
}

function ErrorBanner({ title, message }: { title: string; message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-red-600">{message}</p>
    </div>
  );
}
