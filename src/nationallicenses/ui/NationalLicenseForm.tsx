import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { nationalLicenseService } from "@/nationallicenses/NationalLicenseService";
import { FilePlus, Loader2 } from "lucide-react";
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
  const [formData, setFormData] = useState({
    registration_number: existingLicense?.registration_number || "",
    status: existingLicense?.status || "pending",
    registered_at: existingLicense?.registered_at || "",
    expires_at: existingLicense?.expires_at || "",
    holder_name: existingLicense?.holder_name || "",
    notes: existingLicense?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await nationalLicenseService.upsert({
        property_id: propertyId,
        registration_number: formData.registration_number,
        status: formData.status,
        registered_at: formData.registered_at || null,
        expires_at: formData.expires_at || null,
        holder_name: formData.holder_name || null,
        notes: formData.notes || null,
        source: "manual",
        last_verified_at: new Date().toISOString(),
      });

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
        description: t("nationalLicense.form.successDesc"),
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
            <DialogTitle>{t("nationalLicense.form.title")}</DialogTitle>
            <DialogDescription>
              {t("nationalLicense.form.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="registration_number">
                {t("nationalLicense.form.registrationNumber")}
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">{t("nationalLicense.form.status")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {t("nationalLicense.status.active")}
                  </SelectItem>
                  <SelectItem value="pending">
                    {t("nationalLicense.status.pending")}
                  </SelectItem>
                  <SelectItem value="suspended">
                    {t("nationalLicense.status.suspended")}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t("nationalLicense.status.cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="registered_at">
                  {t("nationalLicense.form.registeredAt")}
                </Label>
                <Input
                  id="registered_at"
                  type="date"
                  value={formData.registered_at}
                  onChange={(e) =>
                    setFormData({ ...formData, registered_at: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expires_at">
                  {t("nationalLicense.form.expiresAt")}
                </Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) =>
                    setFormData({ ...formData, expires_at: e.target.value })
                  }
                />
              </div>
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
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("nationalLicense.form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}