import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle, User } from "lucide-react";

interface OwnershipData {
  registryRef: string;
  ownerName: string;
  ownerIdNumber: string;
  propertyAddress: string;
  cadastralRef: string;
  registrationDate: string;
  matchStatus: "matched" | "pending" | "mismatch";
}

export default function OwnershipVerificationPage() {
  const { t } = useTranslation();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ownershipData, setOwnershipData] = useState<OwnershipData | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      
      setTimeout(() => {
        setOwnershipData({
          registryRef: "REG-2024-ES-BCN-00142",
          ownerName: "María González Pérez",
          ownerIdNumber: "12345678X",
          propertyAddress: "Carrer de la Marina, 156, Barcelona",
          cadastralRef: "9872023VG1797N0001WX",
          registrationDate: "2023-08-15",
          matchStatus: "matched",
        });
      }, 1500);
    }
  };

  const getMatchStatusIcon = (status: string) => {
    switch (status) {
      case "matched":
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case "mismatch":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getMatchStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "matched":
        return "default";
      case "mismatch":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <SEO
        title={t("ownership.page.title")}
        description={t("ownership.page.description")}
      />
      <div className="container py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t("ownership.page.heading")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("ownership.page.subheading")}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t("ownership.upload.title")}
              </CardTitle>
              <CardDescription>{t("ownership.upload.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notaSimple">{t("ownership.upload.label")}</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <Input
                    id="notaSimple"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Label htmlFor="notaSimple" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:underline">
                      {t("ownership.upload.prompt")}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("ownership.upload.help")}
                    </p>
                  </Label>
                </div>
                {uploadedFile && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded text-sm">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span className="flex-1">{uploadedFile.name}</span>
                    <span className="text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {ownershipData && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {t("ownership.registry.title")}
                    </CardTitle>
                    <Badge 
                      variant={getMatchStatusVariant(ownershipData.matchStatus)}
                      className={ownershipData.matchStatus === "matched" ? "bg-accent" : ""}
                    >
                      {getMatchStatusIcon(ownershipData.matchStatus)}
                      <span className="ml-1 capitalize">{ownershipData.matchStatus}</span>
                    </Badge>
                  </div>
                  <CardDescription>{t("ownership.registry.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("ownership.registry.ref")}</p>
                      <p className="text-sm font-mono data-value">{ownershipData.registryRef}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("ownership.registry.date")}</p>
                      <p className="text-sm">{new Date(ownershipData.registrationDate).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("property.profile.cadastralRef")}</p>
                      <p className="text-sm font-mono data-value">{ownershipData.cadastralRef}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t("property.search.address")}</p>
                      <p className="text-sm">{ownershipData.propertyAddress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t("ownership.match.title")}
                  </CardTitle>
                  <CardDescription>{t("ownership.match.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{t("ownership.match.registryOwner")}</p>
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <p className="font-medium">{ownershipData.ownerName}</p>
                        <p className="text-sm text-muted-foreground font-mono data-value">
                          {ownershipData.ownerIdNumber}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{t("ownership.match.verifiedHost")}</p>
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <p className="font-medium">{ownershipData.ownerName}</p>
                        <p className="text-sm text-muted-foreground font-mono data-value">
                          {ownershipData.ownerIdNumber}
                        </p>
                        <Badge variant="default" className="bg-accent">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t("identity.review.verified")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {ownershipData.matchStatus === "matched" && (
                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{t("ownership.match.success")}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("ownership.match.successDesc")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {ownershipData.matchStatus === "mismatch" && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{t("ownership.match.failed")}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("ownership.match.failedDesc")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}