import { useState } from "react";

import Button from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { useStrings } from "@/lib/useStrings";
import type { AnswerFormat, AnswerLanguage, UiLanguage } from "@/types";

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const setAnswerLanguage = useAppStore((s) => s.setAnswerLanguage);
  const setAnswerFormat = useAppStore((s) => s.setAnswerFormat);
  const uiLanguage = useAppStore((s) => s.uiLanguage);
  const setUiLanguage = useAppStore((s) => s.setUiLanguage);
  const history = useAppStore((s) => s.history);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const t = useStrings();

  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    clearHistory();
    setCleared(true);
    window.setTimeout(() => setCleared(false), 2000);
  };

  const uiLanguageOptions: { value: UiLanguage; label: string }[] = [
    { value: "ru", label: "RU" },
    { value: "en", label: "EN" },
  ];
  const answerLanguageOptions: { value: AnswerLanguage; label: string }[] = [
    { value: "auto", label: "Auto" },
    { value: "ru", label: "RU" },
    { value: "en", label: "EN" },
  ];
  const formatOptions: { value: AnswerFormat; label: string }[] = [
    { value: "list", label: t.settings.formatList },
    { value: "structured", label: t.settings.formatStructured },
    { value: "plain", label: t.settings.formatPlain },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 motion-safe:animate-fade-up md:px-8 md:py-14">
      <header className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
          {t.settings.tag}
        </span>
        <h1 className="font-display text-4xl leading-tight text-text md:text-5xl">
          {t.settings.title}
        </h1>
        <p className="max-w-xl text-sm text-subtle">{t.settings.subtitle}</p>
      </header>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface px-5 py-5">
        <SettingRow title={t.settings.uiLanguage} hint={t.settings.uiLanguageHint}>
          <SegmentedControl
            options={uiLanguageOptions}
            value={uiLanguage}
            onChange={setUiLanguage}
            ariaLabel={t.settings.uiLanguage}
          />
        </SettingRow>

        <div className="h-px bg-border" />

        <SettingRow
          title={t.settings.answerLanguage}
          hint={t.settings.answerLanguageHint}
        >
          <SegmentedControl
            options={answerLanguageOptions}
            value={settings.answerLanguage}
            onChange={setAnswerLanguage}
            ariaLabel={t.settings.answerLanguage}
          />
        </SettingRow>

        <div className="h-px bg-border" />

        <SettingRow
          title={t.settings.answerFormat}
          hint={t.settings.answerFormatHint}
        >
          <SegmentedControl
            options={formatOptions}
            value={settings.answerFormat}
            onChange={setAnswerFormat}
            ariaLabel={t.settings.answerFormat}
          />
        </SettingRow>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-5 py-5">
        <h2 className="text-sm font-semibold text-text">
          {t.settings.localData}
        </h2>
        <p className="text-sm text-subtle">
          {t.settings.localDataDesc(history.length)}
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            disabled={history.length === 0}
          >
            {t.settings.clearHistory}
          </Button>
          {cleared && (
            <span role="status" className="text-sm text-subtle">
              {t.settings.cleared}
            </span>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-5 py-5">
        <h2 className="text-sm font-semibold text-text">{t.settings.about}</h2>
        <p className="text-sm text-subtle">{t.settings.aboutDesc}</p>
      </section>
    </div>
  );
}

function SettingRow({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-text">{title}</span>
        {hint && <span className="text-xs text-subtle">{hint}</span>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg border border-border bg-canvas p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={
              "h-8 rounded-md px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20 " +
              (active ? "bg-text text-surface" : "text-subtle hover:text-text")
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
