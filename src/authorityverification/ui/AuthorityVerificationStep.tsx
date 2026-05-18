import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { DocumentService } from "@/documents/DocumentService";
import { AuthorityVerificationService } from "../AuthorityVerificationService";

interface AuthorityVerificationStepProps {
  casePartyId: string;
  onComplete?: () => void;
  isAdminView?: boolean;
}

export function AuthorityVerificationStep({ 
  casePartyId, 
  onComplete,
  isAdminView = false 
}: AuthorityVerificationStepProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form state
  const [mandateType, setMandateType] = useState<string>("power_of_attorney");
  const [principalName, setPrincipalName] = useState("");
  const [principalIdNumber, setPrincipalIdNumber] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentIdNumber, setAgentIdNumber] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [scopeOfAuthority, setScopeOfAuthority] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadVerifications();
  }, [casePartyId]);

  const loadVerifications = async () => {
    try {
      setIsLoading(true);
      const data = await AuthorityVerificationService.getByCasePartyId(casePartyId);
      setVerifications(data);
    } catch (err: any) {
      console.error("Failed to load verifications:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(t("errors.fileTooLarge"));
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(t("errors.noFileSelected"));
      return;
    }

    try {
      setIsLoading(true);
      setUploadingFile(true);
      setError(null);

      // Upload document
      const uploadResult = await DocumentService.uploadDocument({
        file: selectedFile,
        documentType: "other"
      });

      // Create authority verification record
      await AuthorityVerificationService.create({
        casePartyId,
        documentId: uploadResult.id,
        mandateType: mandateType as any,
        principalName,
        principalIdNumber: principalIdNumber || undefined,
        agentName,
        agentIdNumber: agentIdNumber || undefined,
        validFrom: validFrom || undefined,
        validUntil: validUntil || undefined,
        scopeOfAuthority: scopeOfAuthority || undefined,
        notes: notes || undefined,
      });

      // Reset form
      setSelectedFile(null);
      setPrincipalName("");
      setPrincipalIdNumber("");
      setAgentName("");
      setAgentIdNumber("");
      setValidFrom("");
      setValidUntil("");
      setScopeOfAuthority("");
      setNotes("");

      // Reload verifications
      await loadVerifications();

      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      console.error("Failed to submit authority verification:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setUploadingFile(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      verified: "default",
      rejected: "destructive",
      pending: "secondary",
      expired: "outline",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {t(`status.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("authorityVerification.title")}</CardTitle>
          <CardDescription>
            {t("authorityVerification.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verifications.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="font-medium text-sm">{t("authorityVerification.existing")}</h3>
              {verifications.map((verification) => (
                <Card key={verification.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {t(`mandateType.${verification.mandate_type}`)}
                          </span>
                          {getStatusBadge(verification.verification_status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div><strong>{t("authorityVerification.principal")}:</strong> {verification.principal_name}</div>
                          <div><strong>{t("authorityVerification.agent")}:</strong> {verification.agent_name}</div>
                          {verification.scope_of_authority && (
                            <div><strong>{t("authorityVerification.scope")}:</strong> {verification.scope_of_authority}</div>
                          )}
                          {verification.valid_from && verification.valid_until && (
                            <div>
                              <strong>{t("authorityVerification.validity")}:</strong> {verification.valid_from} - {verification.valid_until}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mandateType">{t("authorityVerification.mandateType")} *</Label>
              <Select value={mandateType} onValueChange={setMandateType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="power_of_attorney">{t("mandateType.power_of_attorney")}</SelectItem>
                  <SelectItem value="management_contract">{t("mandateType.management_contract")}</SelectItem>
                  <SelectItem value="board_resolution">{t("mandateType.board_resolution")}</SelectItem>
                  <SelectItem value="other">{t("mandateType.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principalName">{t("authorityVerification.principalName")} *</Label>
                <Input
                  id="principalName"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  required
                  placeholder={t("authorityVerification.principalNamePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="principalIdNumber">{t("authorityVerification.principalIdNumber")}</Label>
                <Input
                  id="principalIdNumber"
                  value={principalIdNumber}
                  onChange={(e) => setPrincipalIdNumber(e.target.value)}
                  placeholder={t("authorityVerification.principalIdNumberPlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">{t("authorityVerification.agentName")} *</Label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  required
                  placeholder={t("authorityVerification.agentNamePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentIdNumber">{t("authorityVerification.agentIdNumber")}</Label>
                <Input
                  id="agentIdNumber"
                  value={agentIdNumber}
                  onChange={(e) => setAgentIdNumber(e.target.value)}
                  placeholder={t("authorityVerification.agentIdNumberPlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">{t("authorityVerification.validFrom")}</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">{t("authorityVerification.validUntil")}</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scopeOfAuthority">{t("authorityVerification.scope")}</Label>
              <Input
                id="scopeOfAuthority"
                value={scopeOfAuthority}
                onChange={(e) => setScopeOfAuthority(e.target.value)}
                placeholder={t("authorityVerification.scopePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("authorityVerification.notes")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("authorityVerification.notesPlaceholder")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">{t("authorityVerification.document")} *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="document"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                {selectedFile && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {selectedFile.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("authorityVerification.fileTypes")}
              </p>
            </div>

            <Button type="submit" disabled={isLoading || !selectedFile} className="w-full">
              {uploadingFile ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  {t("authorityVerification.uploading")}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("authorityVerification.submit")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}