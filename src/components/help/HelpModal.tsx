import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useStrings } from "@/lib/useStrings";
import { AI_MODE_ORDER } from "@/lib/constants";

export default function HelpModal() {
  const isOpen = useAppStore((s) => s.isHelpOpen);
  const closeHelp = useAppStore((s) => s.closeHelp);
  const t = useStrings();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeHelp();
      }
    };

    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeBtnRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, closeHelp]);

  if (!isOpen) return null;

  const h = t.help;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <button
        type="button"
        aria-label={h.close}
        onClick={closeHelp}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm motion-safe:animate-fade"
      />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl2 border border-border bg-surface shadow-soft motion-safe:animate-fade-up">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2
              id="help-modal-title"
              className="font-display text-2xl text-text"
            >
              {h.title}
            </h2>
            <p className="mt-1 text-sm text-subtle">{h.subtitle}</p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeHelp}
            aria-label={h.close}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-subtle transition-colors hover:bg-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20"
          >
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-[14px] leading-relaxed text-text scrollbar-thin">
          <Section title={h.whatTitle}>
            <p>{h.whatBody}</p>
          </Section>

          <Section title={h.howTitle}>
            <ol className="list-decimal space-y-1 pl-5">
              {h.howSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Section>

          <Section title={h.modesTitle}>
            <ul className="list-disc space-y-1 pl-5">
              {AI_MODE_ORDER.map((id) => (
                <li key={id}>
                  <strong>{t.modes[id].label}</strong> — {t.modes[id].description}.
                </li>
              ))}
            </ul>
          </Section>

          <Section title={h.quickTitle}>
            <p>{h.quickBody}</p>
          </Section>

          <Section title={h.localTitle}>
            <ul className="list-disc space-y-1 pl-5">
              {h.localBody.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Section>

          <Section title={h.safetyTitle}>
            <ul className="list-disc space-y-1 pl-5">
              {h.safetyBody.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="flex items-center justify-end border-t border-border px-6 py-3">
          <button
            type="button"
            onClick={closeHelp}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20"
          >
            {h.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className="mb-2 text-[15px] font-semibold text-text">{title}</h3>
      <div className="text-subtle [&_strong]:text-text">{children}</div>
    </section>
  );
}
