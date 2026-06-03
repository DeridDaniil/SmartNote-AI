import Button from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { useStrings } from "@/lib/useStrings";
import type { Strings } from "@/lib/i18n";
import type { HistoryItem } from "@/types";

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

export default function Sidebar() {
  const history = useAppStore((s) => s.history);
  const restoreHistoryItem = useAppStore((s) => s.restoreHistoryItem);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const resetWorkspace = useAppStore((s) => s.resetWorkspace);
  const navigate = useAppStore((s) => s.navigate);
  const closeMobileSidebar = useAppStore((s) => s.closeMobileSidebar);
  const uiLanguage = useAppStore((s) => s.uiLanguage);
  const view = useAppStore((s) => s.view);
  const t = useStrings();

  const locale = uiLanguage === "ru" ? "ru-RU" : "en-US";
  const hasHistory = history.length > 0;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-text text-surface">
          <span className="font-display text-lg leading-none">S</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">
            SmartNote AI
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            {t.sidebar.brandTag}
          </span>
        </div>
      </div>

      <div className="px-4 py-4">
        <Button
          className="w-full"
          variant="secondary"
          size="sm"
          onClick={() => {
            navigate("app");
            resetWorkspace();
            closeMobileSidebar();
          }}
        >
          + {t.sidebar.newText}
        </Button>
      </div>

      <div className="px-5 pb-2 pt-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
          {t.sidebar.recent}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {hasHistory ? (
          <ul className="space-y-1">
            {history.map((item) => (
              <li key={item.id}>
                <HistoryButton
                  item={item}
                  t={t}
                  locale={locale}
                  onSelect={() => {
                    navigate("app");
                    restoreHistoryItem(item.id);
                    closeMobileSidebar();
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-text">
              {t.sidebar.emptyTitle}
            </p>
            <p className="mt-1 text-xs text-subtle">{t.sidebar.emptyHint}</p>
          </div>
        )}
      </nav>

      {hasHistory && (
        <div className="border-t border-border px-4 py-3">
          <Button
            className="w-full"
            variant="ghost"
            size="sm"
            onClick={clearHistory}
          >
            {t.sidebar.clearHistory}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-1 border-t border-border px-4 py-3 text-[12px]">
        <button
          type="button"
          onClick={() => {
            navigate("privacy");
            closeMobileSidebar();
          }}
          className={
            "rounded px-1 py-1 text-left transition-colors hover:text-text " +
            (view === "privacy" ? "text-text" : "text-subtle")
          }
        >
          {t.sidebar.privacy}
        </button>
        <button
          type="button"
          onClick={() => {
            navigate("terms");
            closeMobileSidebar();
          }}
          className={
            "rounded px-1 py-1 text-left transition-colors hover:text-text " +
            (view === "terms" ? "text-text" : "text-subtle")
          }
        >
          {t.sidebar.terms}
        </button>
        <span className="mt-1 px-1 text-[11px] text-subtle">
          {t.sidebar.copyright}
        </span>
      </div>
    </div>
  );
}

function HistoryButton({
  item,
  t,
  locale,
  onSelect,
}: {
  item: HistoryItem;
  t: Strings;
  locale: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
    >
      <p className="line-clamp-1 text-sm font-medium text-text">
        {item.title}
      </p>
      <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-subtle">
        <span>{t.modes[item.mode]?.label ?? item.mode}</span>
        <span aria-hidden="true">·</span>
        <span>{formatDate(item.createdAt, locale)}</span>
      </div>
      {item.preview && (
        <p className="mt-1 line-clamp-2 text-xs text-subtle">{item.preview}</p>
      )}
    </button>
  );
}
