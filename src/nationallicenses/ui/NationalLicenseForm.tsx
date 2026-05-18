import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { nationalLicenseService } from "@/nationallicenses/NationalLicenseService";
import { FilePlus, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type NationalLicense = Database["public"]["Tables"]["national_licenses"]["Row"];

interface NationalLicenseFormProps {
  propertyId: string;
  existingLicense?: NationalLicense | null;
  onSuccess?: () => void;
}

export function NationalLicenseForm({
  propertyId,
  existingLicense,
  onSuccess,
}: NationalLicenseFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [automationStatus, setAutomationStatus] = useState<{
    pending: boolean;
    reason?: string;
    manualWorkflowActive: boolean;
  } | null>(null);
  const [formData, setFormData] = useState({
    registration_number: existingLicense?.registration_number || "",
    holder_name: existingLicense?.holder_name || "",
    notes: existingLicense?.notes || "",
  });

  useEffect(() => {
    // Check NRA automation status
    const status = nationalLicenseService.getAutomationStatus();
    setAutomationStatus(status);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use manual entry workflow
      const { error } = await nationalLicenseService.createManualEntry(
        propertyId,
        formData.registration_number,
        formData.holder_name || undefined,
        formData.notes || undefined
      );

      if (error) {
        toast({
          title: t("nationalLicense.form.error"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t("nationalLicense.form.success"),
        description: t("nationalLicense.form.manualEntrySubmitted"),
      });

      setOpen(false);
      onSuccess?.();
    } catch (err) {
      toast({
        title: t("nationalLicense.form.error"),
        description: t("nationalLicense.form.unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FilePlus className="h-4 w-4" />
          {existingLicense
            ? t("nationalLicense.form.edit")
            : t("nationalLicense.form.add")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("nationalLicense.form.manualEntryTitle")}</DialogTitle>
            <DialogDescription>
              {t("nationalLicense.form.manualEntryDescription")}
            </DialogDescription>
          </DialogHeader>

          {automationStatus?.pending && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("nationalLicense.form.automationPending")}</AlertTitle>
              <AlertDescription>
                {automationStatus.reason || t("nationalLicense.form.manualWorkflowActive")}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="registration_number">
                {t("nationalLicense.form.registrationNumber")} *
              </Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) =>
                  setFormData({ ...formData, registration_number: e.target.value })
                }
                placeholder="NRA-12345"
                required
              />
              <p className="text-xs text-muted-foreground">
                {t("nationalLicense.form.registrationNumberHint")}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="holder_name">
                {t("nationalLicense.form.holderName")}
              </Label>
              <Input
                id="holder_name"
                value={formData.holder_name}
                onChange={(e) =>
                  setFormData({ ...formData, holder_name: e.target.value })
                }
                placeholder={t("nationalLicense.form.holderNamePlaceholder")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">{t("nationalLicense.form.notes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={t("nationalLicense.form.notesPlaceholder")}
                rows={3}
              />
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t("nationalLicense.form.reviewRequired")}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("nationalLicense.form.submitForReview")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}