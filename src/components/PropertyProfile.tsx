import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, FileText, AlertCircle, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { propertyService } from "@/properties/PropertyService";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

interface PropertyProfileProps {
  property: Property;
}

export function PropertyProfile({ property }: PropertyProfileProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [spotCheckResult, setSpotCheckResult] = useState<any>(null);

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

  const handleSpotCheck = async () => {
    if (!property.license_number || !property.region) {
      toast({
        title: t("property.spotCheck.missingData"),
        description: t("property.spotCheck.missingDataDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await propertyService.performSpotCheck(
        property.id,
        property.license_number,
        property.region
      );

      if (error) {
        toast({
          title: t("property.spotCheck.error"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSpotCheckResult(data);
      
      const statusMessages = {
        active: t("property.spotCheck.statusActive"),
        inactive: t("property.spotCheck.statusInactive"),
        not_found: t("property.spotCheck.statusNotFound"),
        error: t("property.spotCheck.statusError"),
      };

      toast({
        title: t("property.spotCheck.complete"),
        description: statusMessages[data?.status || "error"],
      });
    } catch (err) {
      toast({
        title: t("property.spotCheck.error"),
        description: t("property.spotCheck.unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

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
              <p className="text-sm text-muted-foreground">{t("property.profile.region" as any)}</p>
              <p className="text-sm">{property.region || "—"}</p>
            </div>
          </div>

          {property.license_number && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("property.profile.licenseNumber")}</p>
                  <p className="font-mono text-sm tabular-nums">{property.license_number}</p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSpotCheck}
                  disabled={isChecking}
                  className="w-full gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
                  {isChecking ? t("property.spotCheck.checking") : t("property.spotCheck.button")}
                </Button>
                
                {spotCheckResult && (
                  <div className="p-3 bg-muted rounded-md space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("property.spotCheck.status")}</span>
                      <Badge variant={spotCheckResult.status === "active" ? "default" : "secondary"}>
                        {spotCheckResult.status}
                      </Badge>
                    </div>
                    {spotCheckResult.details && (
                      <>
                        {spotCheckResult.details.holder && (
                          <div className="flex items-start justify-between">
                            <span className="text-muted-foreground">{t("property.spotCheck.holder")}</span>
                            <span className="text-right">{spotCheckResult.details.holder}</span>
                          </div>
                        )}
                        {spotCheckResult.details.validFrom && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t("property.spotCheck.validFrom")}</span>
                            <span>{spotCheckResult.details.validFrom}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("property.spotCheck.lastChecked")}</span>
                      <span>{new Date(spotCheckResult.lastChecked).toLocaleString()}</span>
                    </div>
                  </div>
                )}
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