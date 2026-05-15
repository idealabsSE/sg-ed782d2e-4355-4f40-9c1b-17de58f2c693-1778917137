import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";

export default function VerifyIndex() {
  const { t } = useTranslation();

  return (
    <>
      <SEO title="Verify - TrustPlatform" />
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{t("nav.verify")}</h1>
            <p className="text-muted-foreground">
              Choose the verification type to begin
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border hover:border-accent transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>{t("home.cta.property")}</CardTitle>
                <CardDescription>
                  {t("home.feature.property.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/verify/property">
                  <Button className="w-full gap-2">
                    Start Property Verification
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-accent transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>{t("home.cta.identity")}</CardTitle>
                <CardDescription>
                  {t("home.feature.identity.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/verify/identity">
                  <Button className="w-full gap-2">
                    Start Identity Verification
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}