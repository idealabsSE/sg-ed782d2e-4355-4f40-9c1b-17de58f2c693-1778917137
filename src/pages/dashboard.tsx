import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, FileText, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <SEO title={`${t("dashboard.title")} - X Trust`} description={t("dashboard.accountInfo.description")} />
      <div className="bg-muted/30 min-h-[calc(100vh-8rem)]">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground">
              {t("dashboard.welcomeBack")} {user?.email}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>{t("dashboard.verifyProperty.title")}</CardTitle>
                <CardDescription>
                  {t("dashboard.verifyProperty.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/verify/property">{t("dashboard.verifyProperty.button")}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>{t("dashboard.identityVerification.title")}</CardTitle>
                <CardDescription>
                  {t("dashboard.identityVerification.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/verify/identity/swedish">{t("dashboard.identityVerification.swedishButton")}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link href="/verify/identity/spanish">{t("dashboard.identityVerification.spanishButton")}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>{t("dashboard.myCases.title")}</CardTitle>
                <CardDescription>
                  {t("dashboard.myCases.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/cases">{t("dashboard.myCases.button")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("dashboard.accountInfo.title")}</CardTitle>
                  <CardDescription>{t("dashboard.accountInfo.description")}</CardDescription>
                </div>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("dashboard.accountInfo.email")}</p>
                  <p className="font-mono text-sm">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("dashboard.accountInfo.userId")}</p>
                  <p className="font-mono text-sm tabular-nums">{user?.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}