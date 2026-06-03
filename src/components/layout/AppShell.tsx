import { useEffect } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Workspace from "@/components/features/Workspace";
import PrivacyPolicyPage from "@/components/legal/PrivacyPolicyPage";
import TermsPage from "@/components/legal/TermsPage";
import SettingsPage from "@/components/settings/SettingsPage";
import HelpModal from "@/components/help/HelpModal";
import { useAppStore } from "@/store/useAppStore";
import { useStrings } from "@/lib/useStrings";
import { cn } from "@/lib/cn";

export default function AppShell() {
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);
  const isMobileSidebarOpen = useAppStore((s) => s.isMobileSidebarOpen);
  const closeMobileSidebar = useAppStore((s) => s.closeMobileSidebar);
  const navigate = useAppStore((s) => s.navigate);
  const view = useAppStore((s) => s.view);
  const t = useStrings();
  const setViewFromHash = useAppStore((s) => s.setViewFromHash);
  const messagesCount = useAppStore((s) => s.messages.length);
  const status = useAppStore((s) => s.status);
  const isChat =
    view === "app" &&
    (messagesCount > 0 || status === "loading" || status === "error");

  useEffect(() => {
    const onHashChange = () => setViewFromHash();
    window.addEventListener("hashchange", onHashChange);
    setViewFromHash();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [setViewFromHash]);

  // Lock body scroll while the mobile drawer is open and close it on Escape.
  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileSidebar();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isMobileSidebarOpen, closeMobileSidebar]);

  // Scroll the main scroll-container to the top whenever the SPA view changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
    const main = document.getElementById("smartnote-main");
    if (main) main.scrollTop = 0;
  }, [view]);

  return (
    <div className="flex h-screen w-full bg-canvas">
      {/* Desktop side panel */}
      <aside
        className={cn(
          "hidden border-r border-border bg-surface transition-all md:block",
          isSidebarOpen ? "md:w-72" : "md:w-0 md:overflow-hidden",
        )}
      >
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label={t.header.historyAria}
            onClick={closeMobileSidebar}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm motion-safe:animate-fade"
          />
          <div className="absolute left-0 top-0 h-full w-[84vw] max-w-xs border-r border-border bg-surface shadow-soft motion-safe:animate-slide-in-left">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
          id="smartnote-main"
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          {view === "privacy" ? (
            <PrivacyPolicyPage />
          ) : view === "terms" ? (
            <TermsPage />
          ) : view === "settings" ? (
            <SettingsPage />
          ) : (
            <Workspace />
          )}

          {!isChat && (
            <footer className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4 md:px-8">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-border pt-4 text-xs text-subtle">
                <button
                  type="button"
                  onClick={() => navigate("privacy")}
                  className="transition-colors hover:text-text"
                >
                  {t.sidebar.privacy}
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => navigate("terms")}
                  className="transition-colors hover:text-text"
                >
                  {t.sidebar.terms}
                </button>
                <span aria-hidden="true">·</span>
                <span>{t.sidebar.copyright}</span>
              </div>
            </footer>
          )}
        </main>
      </div>

      <HelpModal />
    </div>
  );
}
