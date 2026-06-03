import { useAppStore } from "@/store/useAppStore";
import { useStrings } from "@/lib/useStrings";
import { cn } from "@/lib/cn";
import type { UiLanguage } from "@/types";

export default function Header() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const openMobileSidebar = useAppStore((s) => s.openMobileSidebar);
  const openHelp = useAppStore((s) => s.openHelp);
  const navigate = useAppStore((s) => s.navigate);
  const uiLanguage = useAppStore((s) => s.uiLanguage);
  const setUiLanguage = useAppStore((s) => s.setUiLanguage);
  const t = useStrings();

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b border-border bg-surface/80 px-3 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <button
          type="button"
          aria-label={t.header.historyAria}
          title={t.header.historyAria}
          onClick={() => {
            if (
              typeof window !== "undefined" &&
              window.matchMedia("(max-width: 767px)").matches
            ) {
              openMobileSidebar();
            } else {
              toggleSidebar();
            }
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-subtle transition-colors hover:bg-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20"
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
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => navigate("app")}
          className="flex min-w-0 items-baseline gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20"
          aria-label={t.header.brand}
        >
          <span className="truncate font-display text-lg leading-none md:text-xl">
            {t.header.brand}
          </span>
          <span className="hidden text-xs text-subtle md:inline">
            {t.header.brandTag}
          </span>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 md:gap-2">
        <LanguageToggle
          value={uiLanguage}
          onChange={setUiLanguage}
          ariaLabel={t.header.languageAria}
        />

        <HeaderAction
          onClick={openHelp}
          label={t.header.help}
          ghost
          icon={
            <svg {...iconProps}>
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.6c0 1.5-2.4 2.4-2.4 3.9" />
              <line x1="12" y1="17" x2="12" y2="17.01" />
            </svg>
          }
        />
        <HeaderAction
          onClick={() => navigate("settings")}
          label={t.header.settings}
          icon={
            <svg {...iconProps}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
          }
        />
      </div>
    </header>
  );
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function HeaderAction({
  onClick,
  label,
  icon,
  ghost,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  ghost?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20 sm:px-3",
        ghost
          ? "text-subtle hover:bg-muted hover:text-text"
          : "border border-border bg-surface text-text hover:bg-muted",
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center sm:hidden">
        {icon}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function LanguageToggle({
  value,
  onChange,
  ariaLabel,
}: {
  value: UiLanguage;
  onChange: (lang: UiLanguage) => void;
  ariaLabel: string;
}) {
  const options: UiLanguage[] = ["ru", "en"];
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex shrink-0 rounded-lg border border-border bg-canvas p-0.5"
    >
      {options.map((lang) => {
        const active = lang === value;
        return (
          <button
            key={lang}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(lang)}
            className={cn(
              "h-7 rounded-md px-2 text-xs font-semibold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20",
              active ? "bg-text text-surface" : "text-subtle hover:text-text",
            )}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}
