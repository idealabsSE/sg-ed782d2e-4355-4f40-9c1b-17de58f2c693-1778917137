import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, FileText, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

interface PropertyProfileProps {
  property: Property;
}

export function PropertyProfile({ property }: PropertyProfileProps) {
  const { t } = useTranslation();

  const licenseStatus = property.license_status || "none";

  const statusConfig = {
    verified: {
      variant: "default" as const,
      icon: CheckCircle,
      label: t("property.profile.status.verified"),
    },
    pending: {
      variant: "secondary" as const,
      icon: AlertCircle,
      label: t("property.profile.status.pending"),
    },
    none: {
      variant: "destructive" as const,
      icon: AlertCircle,
      label: t("property.profile.status.none"),
    },
  };

  const status = statusConfig[licenseStatus as keyof typeof statusConfig] || statusConfig.none;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{t("property.profile.title")}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                {property.address}
              </CardDescription>
            </div>
            <Badge variant={status.variant} className="gap-1.5">
              <status.icon className="h-3.5 w-3.5" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("property.profile.cadastralRef")}</p>
              <p className="font-mono text-sm tabular-nums">{property.cadastral_reference}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("property.profile.propertyType")}</p>
              <p className="text-sm">{property.property_type || t("property.types.apartment")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("property.profile.municipality")}</p>
              <p className="text-sm">{property.municipality || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("property.profile.province")}</p>
              <p className="text-sm">{property.province || "—"}</p>
            </div>
          </div>

          {property.license_number && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("property.profile.licenseNumber")}</p>
                <p className="font-mono text-sm tabular-nums">{property.license_number}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            <CardTitle>{t("property.compliance.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("property.compliance.description")}
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">{t("property.compliance.touristLicense")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("property.compliance.touristLicenseDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">{t("property.compliance.registration")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("property.compliance.registrationDesc")}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/verify/identity">
              <Button className="w-full gap-2">
                {t("property.profile.nextStep")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}