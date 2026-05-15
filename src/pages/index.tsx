import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title="TrustPlatform - Cross-Border Rental Verification"
        description="Verify properties, identities, and ownership connections across Sweden and Spain"
      />
      <div className="container py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-accent/10 mb-4">
            <Shield className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            {t("home.hero.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.hero.subtitle")}
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/verify/property">
              <Button size="lg" className="gap-2">
                {t("home.cta.property")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/verify/identity">
              <Button size="lg" variant="outline" className="gap-2">
                {t("home.cta.identity")}
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">
                {t("home.feature.property.title")}
              </CardTitle>
              <CardDescription>
                {t("home.feature.property.description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">
                {t("home.feature.identity.title")}
              </CardTitle>
              <CardDescription>
                {t("home.feature.identity.description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">
                {t("home.feature.ownership.title")}
              </CardTitle>
              <CardDescription>
                {t("home.feature.ownership.description")}
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div>
    </>
  );
}