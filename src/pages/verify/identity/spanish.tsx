import { useTranslation } from "@/hooks/useTranslation";
import { SEO } from "@/components/SEO";
import { VerificationWizard } from "@/components/VerificationWizard";

export default function SpanishVerification() {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t("identity.spanish.title")}
        description={t("identity.spanish.description")}
      />
      <div className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{t("identity.spanish.heading")}</h1>
            <p className="text-muted-foreground">
              {t("identity.spanish.subheading")}
            </p>
          </div>

          <VerificationWizard variant="spanish" />
        </div>
      </div>
    </>
  );
}