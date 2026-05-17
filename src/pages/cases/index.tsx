import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { SEO } from "@/components/SEO";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building, Users, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { caseService, type CaseWithDetails } from "@/verificationcases/CaseService";
import { useToast } from "@/hooks/use-toast";

export default function CasesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [cases, setCases] = useState<CaseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setIsLoading(true);
    const { data, error } = await caseService.getUserCases();
    
    console.log("Cases loaded:", { data, error });

    if (error) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCases(data);
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "flagged":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "verified":
        return "default";
      case "pending":
        return "secondary";
      case "flagged":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SEO
          title={t("cases.page.title")}
          description={t("cases.page.description")}
        />
        <div className="container py-12">
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SEO
        title={t("cases.page.title")}
        description={t("cases.page.description")}
      />
      <div className="container py-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t("cases.page.heading")}</h1>
              <p className="text-muted-foreground mt-2">
                {t("cases.page.subheading")}
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("cases.create")}
            </Button>
          </div>

          {cases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <Users className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">{t("cases.noCases")}</h3>
                  <p className="text-sm text-muted-foreground">{t("cases.noCasesDesc")}</p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("cases.createFirst")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {cases.map((caseItem) => (
                <Card key={caseItem.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <span className="font-mono text-base">{caseItem.case_number}</span>
                          <Badge
                            variant={caseItem.status === "complete" ? "default" : caseItem.status === "flagged" ? "destructive" : "secondary"}
                            className={caseItem.status === "complete" ? "bg-accent" : ""}
                          >
                            {caseItem.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {t("cases.created")}: {formatDate(caseItem.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {caseItem.property && (
                      <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                        <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{caseItem.property.address}</p>
                          <p className="text-sm text-muted-foreground font-mono data-value">
                            {caseItem.property.cadastral_reference}
                          </p>
                        </div>
                      </div>
                    )}

                    {caseItem.parties && caseItem.parties.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Users className="h-4 w-4" />
                          {t("cases.parties")}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {caseItem.parties.map((party) => (
                            <div key={party.id} className="flex items-start gap-3 p-3 border rounded-lg">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="capitalize">
                                    {party.role}
                                  </Badge>
                                  {party.verification_status && (
                                    <Badge variant={getStatusVariant(party.verification_status)} className={party.verification_status === "verified" ? "bg-accent" : ""}>
                                      {getStatusIcon(party.verification_status)}
                                      <span className="ml-1 capitalize">{party.verification_status}</span>
                                    </Badge>
                                  )}
                                </div>
                                {party.profile && (
                                  <>
                                    <p className="font-medium">{party.profile.full_name || party.profile.email}</p>
                                    <p className="text-sm text-muted-foreground">{party.profile.email}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Link href={`/cases/${caseItem.id}`}>
                        <Button variant="outline">
                          {t("cases.viewDetails")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}