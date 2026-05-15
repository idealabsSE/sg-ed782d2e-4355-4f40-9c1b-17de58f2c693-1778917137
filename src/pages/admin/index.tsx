import { useTranslation } from "@/hooks/useTranslation";
import { SEO } from "@/components/SEO";

export default function Admin() {
  const { t } = useTranslation();

  return (
    <>
      <SEO title="Admin - TrustPlatform" />
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{t("nav.admin")}</h1>
            <p className="text-muted-foreground">
              Internal reviewer operations - Coming soon
            </p>
          </div>
        </div>
      </div>
    </>
  );
}