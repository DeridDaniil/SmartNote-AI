import { useAppStore } from "@/store/useAppStore";
import { getStrings, type Strings } from "@/lib/i18n";

/** Returns the UI string table for the current interface language. */
export const useStrings = (): Strings =>
  getStrings(useAppStore((s) => s.uiLanguage));
