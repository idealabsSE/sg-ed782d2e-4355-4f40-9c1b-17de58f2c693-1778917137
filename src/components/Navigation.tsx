import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, Globe, User, LogOut } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { Locale } from "@/lib/i18n";
import { useRouter } from "next/router";

export function Navigation() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const localeLabels: Record<Locale, string> = {
    en: "English",
    sv: "Svenska",
    es: "Español",
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Shield className="h-6 w-6 text-accent" />
          <span className="text-foreground">X Trust</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            {t("nav.home")}
          </Link>
          
          {user && (
            <>
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
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                >
                  {t("nav.admin")}
                </Link>
              )}
            </>
          )}

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

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}