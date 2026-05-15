import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, Globe } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { Locale } from "@/lib/i18n";

export function Navigation() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  const localeLabels: Record<Locale, string> = {
    en: "English",
    sv: "Svenska",
    es: "Español",
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Shield className="h-6 w-6 text-accent" />
          <span className="text-foreground">TrustPlatform</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/verify"
            className="text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            {t("nav.verify")}
          </Link>
          <Link
            href="/cases"
            className="text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            {t("nav.cases")}
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            {t("nav.admin")}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{localeLabels[locale]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocale("en")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("sv")}>
                Svenska
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("es")}>
                Español
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}