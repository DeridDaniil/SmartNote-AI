import { useAppStore } from "@/store/useAppStore";
import { useStrings } from "@/lib/useStrings";
import type { AIMode } from "@/types";

type QuickActionId =
  | "shorter"
  | "simpler"
  | "academic"
  | "outline"
  | "questions";

// Each quick action maps to a target mode; labels/prompts come from i18n.
const ACTION_MODES: Record<QuickActionId, AIMode> = {
  shorter: "summary",
  simpler: "rewrite",
  academic: "copyPolish",
  outline: "outline",
  questions: "quiz",
};

const ORDER: QuickActionId[] = [
  "shorter",
  "simpler",
  "academic",
  "outline",
  "questions",
];

export default function QuickActions() {
  const messages = useAppStore((s) => s.messages);
  const status = useAppStore((s) => s.status);
  const prefillComposer = useAppStore((s) => s.prefillComposer);
  const t = useStrings();

  const latestResult = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.content.trim().length > 0)
    ?.content;

  // Only offer quick actions once there is a finished result to work from.
  if (!latestResult || status === "loading") return null;

  return (
    <div className="mt-4">
      <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
        {t.quickActions.heading}
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
        {ORDER.map((id) => {
          const action = t.quickActions.items[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() =>
                prefillComposer(
                  `${action.prompt}\n\n${latestResult}`,
                  ACTION_MODES[id],
                )
              }
              className="inline-flex h-9 shrink-0 items-center rounded-full border border-border bg-surface px-3.5 text-sm font-medium text-text transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-text/20"
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
