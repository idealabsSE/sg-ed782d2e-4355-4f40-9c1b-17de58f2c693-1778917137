import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, Upload, CheckCircle, ArrowRight, ArrowLeft, FileText } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type VerificationStep = "role" | "documents" | "review";
type UserRole = "tenant" | "host" | "";
type SwedishDocumentType = "personnummer" | "passport" | "id-card" | "";
type SpanishDocumentType = "dni" | "nie" | "";
type DocumentType = SwedishDocumentType | SpanishDocumentType;

interface VerificationData {
  role: UserRole;
  documentType: DocumentType;
  idNumber: string;
  uploadedFiles: File[];
}

interface VerificationWizardProps {
  variant?: "swedish" | "spanish";
}

export function VerificationWizard({ variant = "swedish" }: VerificationWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<VerificationStep>("role");
  const [data, setData] = useState<VerificationData>({
    role: "",
    documentType: "",
    idNumber: "",
    uploadedFiles: [],
  });

  const steps: VerificationStep[] = ["role", "documents", "review"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleRoleSelect = (role: UserRole) => {
    setData({ ...data, role });
  };

  const handleDocumentTypeChange = (type: DocumentType) => {
    setData({ ...data, documentType: type });
  };

  const handleIdNumberChange = (idNumber: string) => {
    setData({ ...data, idNumber });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setData({ ...data, uploadedFiles: Array.from(e.target.files) });
    }
  };

  const canProceedFromRole = data.role !== "";
  const canProceedFromDocuments = data.documentType !== "" && data.idNumber !== "" && data.uploadedFiles.length > 0;

  const handleNext = () => {
    if (currentStep === "role" && canProceedFromRole) {
      setCurrentStep("documents");
    } else if (currentStep === "documents" && canProceedFromDocuments) {
      setCurrentStep("review");
    }
  };

  const handleBack = () => {
    if (currentStep === "documents") {
      setCurrentStep("role");
    } else if (currentStep === "review") {
      setCurrentStep("documents");
    }
  };

  const getPlaceholder = () => {
    if (variant === "swedish") {
      return data.documentType === "personnummer" ? "YYYYMMDD-XXXX" : "";
    } else {
      return data.documentType === "dni" ? "12345678X" : data.documentType === "nie" ? "X1234567X" : "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("identity.wizard.step")} {currentStepIndex + 1} / {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {currentStep === "role" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("identity.role.title")}
            </CardTitle>
            <CardDescription>{t("identity.role.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={data.role} onValueChange={handleRoleSelect}>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                <RadioGroupItem value="tenant" id="tenant" />
                <div className="flex-1 cursor-pointer" onClick={() => handleRoleSelect("tenant")}>
                  <Label htmlFor="tenant" className="cursor-pointer font-medium">
                    {t("identity.role.tenant")}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("identity.role.tenantDesc")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                <RadioGroupItem value="host" id="host" />
                <div className="flex-1 cursor-pointer" onClick={() => handleRoleSelect("host")}>
                  <Label htmlFor="host" className="cursor-pointer font-medium">
                    {t("identity.role.host")}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("identity.role.hostDesc")}
                  </p>
                </div>
              </div>
            </RadioGroup>
            <Button onClick={handleNext} disabled={!canProceedFromRole} className="w-full gap-2">
              {t("identity.wizard.continue")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === "documents" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("identity.documents.title")}
            </CardTitle>
            <CardDescription>{t("identity.documents.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="documentType">{t("identity.documents.type")}</Label>
              <Select value={data.documentType} onValueChange={handleDocumentTypeChange}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder={t("identity.documents.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {variant === "swedish" ? (
                    <>
                      <SelectItem value="personnummer">{t("identity.documents.personnummer")}</SelectItem>
                      <SelectItem value="id-card">{t("identity.documents.idCard")}</SelectItem>
                      <SelectItem value="passport">{t("identity.documents.passport")}</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="dni">{t("identity.documents.dni")}</SelectItem>
                      <SelectItem value="nie">{t("identity.documents.nie")}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">{t("identity.documents.idNumber")}</Label>
              <Input
                id="idNumber"
                type="text"
                placeholder={getPlaceholder()}
                value={data.idNumber}
                onChange={(e) => handleIdNumberChange(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {t("identity.documents.idHelp")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload">{t("identity.documents.upload")}</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <Input
                  id="upload"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Label htmlFor="upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:underline">
                    {t("identity.documents.uploadPrompt")}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("identity.documents.uploadHelp")}
                  </p>
                </Label>
              </div>
              {data.uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-4">
                  {data.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleBack} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t("identity.wizard.back")}
              </Button>
              <Button onClick={handleNext} disabled={!canProceedFromDocuments} className="flex-1 gap-2">
                {t("identity.wizard.continue")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "review" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              {t("identity.review.title")}
            </CardTitle>
            <CardDescription>{t("identity.review.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div>
                  <p className="text-sm font-medium">{t("identity.review.role")}</p>
                  <p className="text-sm text-muted-foreground capitalize">{data.role}</p>
                </div>
                <Badge variant="default" className="bg-accent">
                  {t("identity.review.verified")}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("identity.review.documentType")}</p>
                  <p className="text-sm font-medium capitalize">{data.documentType.replace("-", " ")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("identity.review.idNumber")}</p>
                  <p className="text-sm font-mono data-value">{data.idNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t("identity.review.documents")}</p>
                <div className="space-y-2">
                  {data.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span className="flex-1 truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium text-sm">{t("identity.review.trustSignals")}</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>{t("identity.review.signal.identity")}</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>{t("identity.review.signal.documents")}</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>{t("identity.review.signal.role")}</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleBack} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t("identity.wizard.back")}
              </Button>
              <Button className="flex-1 gap-2">
                {t("identity.review.submit")}
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}