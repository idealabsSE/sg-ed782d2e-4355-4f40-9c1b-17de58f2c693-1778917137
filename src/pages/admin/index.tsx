import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { SEO } from "@/components/SEO";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Flag, FileText, User, MapPin, Loader2 } from "lucide-react";
import { caseService, type CaseWithDetails } from "@/verificationcases/CaseService";
import { verificationService } from "@/services/verificationService";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [cases, setCases] = useState<CaseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setIsLoading(true);
    const { data, error } = await caseService.getPendingReviewCases();
    
    console.log("Pending cases loaded:", { data, error });

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
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case "flagged":
        return <Flag className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "verified":
        return "default";
      case "flagged":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" => {
    return priority === "high" ? "destructive" : "secondary";
  };

  const handleApprove = async (caseId: string) => {
    if (!reviewNote.trim()) return;
    
    setIsSubmitting(true);
    const { error } = await caseService.updateCaseStatus(caseId, "complete");
    
    if (error) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("admin.review.approved"),
        description: t("admin.review.approvedDesc"),
      });
      await loadCases();
      setReviewNote("");
      setSelectedCase(null);
    }
    setIsSubmitting(false);
  };

  const handleReject = async (caseId: string) => {
    if (!reviewNote.trim()) return;
    
    setIsSubmitting(true);
    const { error } = await caseService.updateCaseStatus(caseId, "rejected");
    
    if (error) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("admin.review.rejected"),
        description: t("admin.review.rejectedDesc"),
      });
      await loadCases();
      setReviewNote("");
      setSelectedCase(null);
    }
    setIsSubmitting(false);
  };

  const handleFlag = async (caseId: string) => {
    if (!reviewNote.trim()) return;
    
    setIsSubmitting(true);
    const { error } = await caseService.updateCaseStatus(caseId, "flagged");
    
    if (error) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("admin.review.flagged"),
        description: t("admin.review.flaggedDesc"),
      });
      await loadCases();
      setReviewNote("");
      setSelectedCase(null);
    }
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SEO
          title={t("admin.page.title")}
          description={t("admin.page.description")}
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
        title={t("admin.page.title")}
        description={t("admin.page.description")}
      />
      <div className="container py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.page.heading")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("admin.page.subheading")}
            </p>
          </div>

          {cases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <CheckCircle className="h-12 w-12 text-accent" />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">{t("admin.noCases")}</h3>
                  <p className="text-sm text-muted-foreground">{t("admin.noCasesDesc")}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cases.map((caseItem) => {
                const tenant = caseItem.parties?.find(p => p.role === "tenant");
                const host = caseItem.parties?.find(p => p.role === "host");
                
                return (
                  <Card key={caseItem.id} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            <span className="font-mono text-base">{caseItem.case_number}</span>
                            <Badge variant="secondary">
                              {caseItem.status}
                            </Badge>
                          </CardTitle>
                          {caseItem.property && (
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <MapPin className="h-3 w-3" />
                              {caseItem.property.address}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground uppercase">{t("admin.property")}</p>
                          {caseItem.property && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{t("property.profile.cadastralRef")}</p>
                              <p className="text-xs font-mono data-value text-muted-foreground">
                                {caseItem.property.cadastral_reference}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground uppercase">{t("identity.role.tenant")}</p>
                          {tenant && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {tenant.profile?.full_name || tenant.profile?.email || "Unknown"}
                              </span>
                              {tenant.verification_status && (
                                <Badge variant={getStatusVariant(tenant.verification_status)} className="ml-auto">
                                  {getStatusIcon(tenant.verification_status)}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground uppercase">{t("identity.role.host")}</p>
                          {host && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {host.profile?.full_name || host.profile?.email || "Unknown"}
                              </span>
                              {host.verification_status && (
                                <Badge variant={getStatusVariant(host.verification_status)} className="ml-auto">
                                  {getStatusIcon(host.verification_status)}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedCase === caseItem.id ? (
                        <div className="space-y-4 pt-4 border-t">
                          <div className="space-y-2">
                            <Label htmlFor={`note-${caseItem.id}`}>{t("admin.review.note")}</Label>
                            <Textarea
                              id={`note-${caseItem.id}`}
                              placeholder={t("admin.review.notePlaceholder")}
                              value={reviewNote}
                              onChange={(e) => setReviewNote(e.target.value)}
                              rows={3}
                              className="resize-none"
                              disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                              {t("admin.review.noteHelp")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(caseItem.id)}
                              disabled={!reviewNote.trim() || isSubmitting}
                              className="gap-2"
                            >
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              {t("admin.review.approve")}
                            </Button>
                            <Button
                              onClick={() => handleReject(caseItem.id)}
                              disabled={!reviewNote.trim() || isSubmitting}
                              variant="destructive"
                              className="gap-2"
                            >
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                              {t("admin.review.reject")}
                            </Button>
                            <Button
                              onClick={() => handleFlag(caseItem.id)}
                              disabled={!reviewNote.trim() || isSubmitting}
                              variant="outline"
                              className="gap-2"
                            >
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
                              {t("admin.review.flag")}
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedCase(null);
                                setReviewNote("");
                              }}
                              variant="ghost"
                              className="ml-auto"
                              disabled={isSubmitting}
                            >
                              {t("admin.review.cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setSelectedCase(caseItem.id)}
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          {t("admin.review.review")}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}