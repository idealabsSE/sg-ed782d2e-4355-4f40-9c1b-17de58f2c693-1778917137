import { useTranslation } from "@/hooks/useTranslation";
import { SEO } from "@/components/SEO";

export default function Cases() {
  const { t } = useTranslation();

  return (
    <>
      <SEO title="Cases - TrustPlatform" />
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{t("nav.cases")}</h1>
            <p className="text-muted-foreground">
              B2B case management interface - Coming soon
            </p>
          </div>
        </div>
      </div>
    </>
  );
}