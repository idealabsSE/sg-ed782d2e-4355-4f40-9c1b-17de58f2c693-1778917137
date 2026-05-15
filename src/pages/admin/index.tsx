import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Flag, FileText, User, MapPin } from "lucide-react";

interface ReviewCase {
  id: string;
  property: string;
  cadastralRef: string;
  tenant: { name: string; status: "verified" | "pending" | "flagged" };
  host: { name: string; status: "verified" | "pending" | "flagged" };
  ownershipMatch: "matched" | "pending" | "mismatch";
  createdAt: string;
  priority: "high" | "medium" | "low";
}

export default function AdminPage() {
  const { t } = useTranslation();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  
  const mockCases: ReviewCase[] = [
    {
      id: "CASE-2024-001",
      property: "Carrer de la Marina, 156, Barcelona",
      cadastralRef: "9872023VG1797N0001WX",
      tenant: { name: "Erik Andersson", status: "verified" },
      host: { name: "María González", status: "pending" },
      ownershipMatch: "pending",
      createdAt: "2024-05-15",
      priority: "high",
    },
    {
      id: "CASE-2024-002",
      property: "Calle Gran Vía, 28, Madrid",
      cadastralRef: "1234567AB8901CD0002EF",
      tenant: { name: "Anna Svensson", status: "verified" },
      host: { name: "Carlos Ruiz", status: "verified" },
      ownershipMatch: "mismatch",
      createdAt: "2024-05-14",
      priority: "high",
    },
    {
      id: "CASE-2024-003",
      property: "Paseo de la Castellana, 45, Madrid",
      cadastralRef: "5678901CD2345EF0003GH",
      tenant: { name: "Lars Nilsson", status: "verified" },
      host: { name: "Isabel Martínez", status: "flagged" },
      ownershipMatch: "pending",
      createdAt: "2024-05-13",
      priority: "medium",
    },
  ];

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

  const handleApprove = (caseId: string) => {
    console.log("Approved case:", caseId, "Note:", reviewNote);
    setReviewNote("");
    setSelectedCase(null);
  };

  const handleReject = (caseId: string) => {
    console.log("Rejected case:", caseId, "Note:", reviewNote);
    setReviewNote("");
    setSelectedCase(null);
  };

  const handleFlag = (caseId: string) => {
    console.log("Flagged case:", caseId, "Note:", reviewNote);
    setReviewNote("");
    setSelectedCase(null);
  };

  return (
    <>
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

          <div className="space-y-4">
            {mockCases.map((caseItem) => (
              <Card key={caseItem.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <span className="font-mono text-base">{caseItem.id}</span>
                        <Badge variant={getPriorityVariant(caseItem.priority)} className="capitalize">
                          {caseItem.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3" />
                        {caseItem.property}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={getStatusVariant(caseItem.ownershipMatch)}
                      className={caseItem.ownershipMatch === "matched" ? "bg-accent" : ""}
                    >
                      {caseItem.ownershipMatch === "matched" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {caseItem.ownershipMatch === "mismatch" && <AlertCircle className="h-3 w-3 mr-1" />}
                      {caseItem.ownershipMatch === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                      {t(`admin.ownership.${caseItem.ownershipMatch}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase">{t("admin.property")}</p>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{t("property.profile.cadastralRef")}</p>
                        <p className="text-xs font-mono data-value text-muted-foreground">
                          {caseItem.cadastralRef}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase">{t("identity.role.tenant")}</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{caseItem.tenant.name}</span>
                        <Badge variant={getStatusVariant(caseItem.tenant.status)} className="ml-auto">
                          {getStatusIcon(caseItem.tenant.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase">{t("identity.role.host")}</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{caseItem.host.name}</span>
                        <Badge variant={getStatusVariant(caseItem.host.status)} className="ml-auto">
                          {getStatusIcon(caseItem.host.status)}
                        </Badge>
                      </div>
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
                        />
                        <p className="text-xs text-muted-foreground">
                          {t("admin.review.noteHelp")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(caseItem.id)}
                          disabled={!reviewNote.trim()}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {t("admin.review.approve")}
                        </Button>
                        <Button
                          onClick={() => handleReject(caseItem.id)}
                          disabled={!reviewNote.trim()}
                          variant="destructive"
                          className="gap-2"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {t("admin.review.reject")}
                        </Button>
                        <Button
                          onClick={() => handleFlag(caseItem.id)}
                          disabled={!reviewNote.trim()}
                          variant="outline"
                          className="gap-2"
                        >
                          <Flag className="h-4 w-4" />
                          {t("admin.review.flag")}
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedCase(null);
                            setReviewNote("");
                          }}
                          variant="ghost"
                          className="ml-auto"
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
            ))}
          </div>
        </div>
      </div>
    </>
  );
}