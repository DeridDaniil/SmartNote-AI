import { useAppStore } from "@/store/useAppStore";
import { useStrings } from "@/lib/useStrings";
import Button from "@/components/ui/Button";

export default function TermsPage() {
  const navigate = useAppStore((s) => s.navigate);
  const t = useStrings();

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 motion-safe:animate-fade-up md:px-8 md:py-14">
      <header className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
          {t.legal.docTag}
        </span>
        <h1 className="font-display text-4xl leading-tight text-text md:text-5xl">
          {t.legal.termsTitle}
        </h1>
        <p className="text-sm text-subtle">{t.legal.updated}</p>
      </header>

      <div className="flex flex-col gap-5 text-[14px] leading-relaxed text-text">
        {t.legal.termsSections.map((section) => (
          <section key={section.title} className="flex flex-col gap-2">
            <h2 className="font-display text-xl text-text">{section.title}</h2>
            <div className="flex flex-col gap-2 text-subtle">
              {section.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="pt-2">
        <Button variant="secondary" size="sm" onClick={() => navigate("app")}>
          {t.legal.back}
        </Button>
      </div>
    </article>
  );
}
