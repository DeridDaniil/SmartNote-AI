import { useEffect, useRef } from "react";

import ChatComposer from "./ChatComposer";
import ResultPanel from "./ResultPanel";
import QuickActions from "./QuickActions";
import { useAppStore } from "@/store/useAppStore";
import { useStrings } from "@/lib/useStrings";

const MAIN_ID = "smartnote-main";

export default function Workspace() {
  const mode = useAppStore((s) => s.mode);
  const messages = useAppStore((s) => s.messages);
  const status = useAppStore((s) => s.status);
  const t = useStrings();
  const activeModeLabel = t.modes[mode]?.label;

  const isChat =
    messages.length > 0 || status === "loading" || status === "error";
  const lastAssistantContent =
    [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";

  // Auto-follow only when the user is already near the bottom — keeps new
  // chunks visible without yanking the page when they're scrolling history.
  const autoFollowRef = useRef(true);

  useEffect(() => {
    if (!isChat) return;
    const main = document.getElementById(MAIN_ID);
    if (!main) return;
    const onScroll = () => {
      const distanceFromBottom =
        main.scrollHeight - main.scrollTop - main.clientHeight;
      autoFollowRef.current = distanceFromBottom < 120;
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [isChat]);

  useEffect(() => {
    if (!isChat) return;
    if (!autoFollowRef.current) return;
    const main = document.getElementById(MAIN_ID);
    if (!main) return;
    main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
  }, [messages.length, lastAssistantContent, status, isChat]);

  if (!isChat) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-10 motion-safe:animate-fade-up md:px-8 md:py-14">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
            {t.hero.tag}
          </span>
          <h1 className="font-display text-4xl leading-tight text-text md:text-5xl">
            {t.hero.headline}
          </h1>
          <p className="max-w-xl text-sm text-subtle">{t.hero.subtitle}</p>
          <p className="max-w-xl text-xs text-subtle">{t.hero.privacyNote}</p>
        </header>

        <ChatComposer variant="hero" />

        <div className="flex flex-wrap items-center justify-center gap-2">
          {t.hero.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-subtle"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-6 md:px-8 md:pt-8">
      <ResultPanel modeLabel={activeModeLabel} />

      <QuickActions />

      <div className="sticky bottom-0 z-20 -mx-4 mt-4 border-t border-border bg-canvas/85 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <ChatComposer variant="compact" />
      </div>
    </div>
  );
}
