import { useLocale } from "@/contexts/LocaleContext";
import { getTranslation, TranslationKey } from "@/lib/i18n";

export function useTranslation() {
  const { locale } = useLocale();

  const t = (key: TranslationKey): string => {
    return getTranslation(locale, key);
  };

  return { t, locale };
}