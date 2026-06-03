import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { useAppStore } from "@/store/useAppStore";
import { useStrings } from "@/lib/useStrings";
import { AI_MODE_ORDER, MAX_INPUT_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface ChatComposerProps {
  variant?: "hero" | "compact";
}

export default function ChatComposer({
  variant = "compact",
}: ChatComposerProps) {
  const input = useAppStore((s) => s.input);
  const setInput = useAppStore((s) => s.setInput);
  const submitRequest = useAppStore((s) => s.submitRequest);
  const status = useAppStore((s) => s.status);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const composerFocusTick = useAppStore((s) => s.composerFocusTick);
  const uiLanguage = useAppStore((s) => s.uiLanguage);
  const t = useStrings();

  const isLoading = status === "loading";
  const charCount = input.length;
  const overLimit = charCount > MAX_INPUT_LENGTH;
  const hasInput = input.trim().length > 0;
  const canRun = hasInput && !isLoading && !overLimit;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeContainerRef = useRef<HTMLDivElement>(null);
  const [modeOpen, setModeOpen] = useState(false);

  const maxHeight = variant === "hero" ? 280 : 200;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [input, maxHeight]);

  // Focus the composer when quick actions request it via the store.
  useEffect(() => {
    if (composerFocusTick === 0) return;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, [composerFocusTick]);

  useEffect(() => {
    if (!modeOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!modeContainerRef.current) return;
      if (!modeContainerRef.current.contains(e.target as Node)) {
        setModeOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModeOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [modeOpen]);

  const activeMode = t.modes[mode];

  const handleSubmit = () => {
    if (!canRun) return;
    void submitRequest();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-surface shadow-soft transition-colors focus-within:border-text/30",
        variant === "hero" ? "px-3 py-3" : "px-3 py-2.5",
      )}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={
          variant === "hero"
            ? t.composer.placeholderHero
            : t.composer.placeholderCompact
        }
        rows={1}
        disabled={isLoading}
        aria-label={t.composer.inputAria}
        className={cn(
          "block w-full resize-none border-none bg-transparent px-2 leading-relaxed text-text placeholder:text-subtle focus:outline-none disabled:opacity-70",
          variant === "hero"
            ? "min-h-[64px] py-2 text-[15px]"
            : "min-h-[40px] py-1.5 text-[14.5px]",
        )}
        style={{ maxHeight }}
      />

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative" ref={modeContainerRef}>
            <button
              type="button"
              aria-label={t.composer.modeAria}
              aria-haspopup="menu"
              aria-expanded={modeOpen}
              onClick={() => setModeOpen((v) => !v)}
              title={activeMode?.description ?? t.composer.modeFallback}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-2.5 text-xs font-medium text-text transition-colors hover:bg-muted",
                modeOpen && "bg-muted",
              )}
            >
              <SlidersIcon />
              <span className="max-w-[140px] truncate">
                {activeMode?.label ?? t.composer.modeFallback}
              </span>
              <ChevronDownIcon />
            </button>

            {modeOpen && (
              <div
                role="menu"
                aria-label={t.composer.modeAria}
                className="absolute bottom-full left-0 z-30 mb-2 w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-soft motion-safe:animate-fade-up"
              >
                <ul className="py-1">
                  {AI_MODE_ORDER.map((id) => {
                    const active = id === mode;
                    const m = t.modes[id];
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          role="menuitemradio"
                          aria-checked={active}
                          onClick={() => {
                            setMode(id);
                            setModeOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-start gap-3 px-3 py-2 text-left transition-colors",
                            active ? "bg-muted" : "hover:bg-muted",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "mt-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                              active ? "border-text" : "border-border",
                            )}
                          >
                            {active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-text" />
                            )}
                          </span>
                          <span className="flex flex-col">
                            <span className="text-sm font-medium text-text">
                              {m.label}
                            </span>
                            <span className="text-xs text-subtle">
                              {m.description}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {overLimit && (
            <span className="truncate text-xs text-text/70">
              {t.composer.charLimit(
                MAX_INPUT_LENGTH.toLocaleString(
                  uiLanguage === "ru" ? "ru-RU" : "en-US",
                ),
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={isLoading ? t.composer.generating : t.composer.send}
            disabled={!canRun}
            onClick={handleSubmit}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              canRun
                ? "bg-text text-surface hover:bg-text/90"
                : "cursor-not-allowed bg-muted text-subtle",
            )}
          >
            {isLoading ? <SquareIcon /> : <ArrowUpIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}
