/**
 * NotificationPreferences Component
 * 
 * Allows users to configure their notification preferences
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationService } from "../NotificationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Bell } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function NotificationPreferences() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    case_invite: true,
    verification_complete: true,
    review_decision: true,
    status_update: true,
    digest_frequency: "immediate" as "immediate" | "daily" | "weekly" | "never",
    preferred_locale: null as "en" | "sv" | "es" | null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    setLoading(true);
    const prefs = await NotificationService.getPreferences(user.id);
    
    if (prefs) {
      setPreferences({
        email_enabled: prefs.email_enabled,
        case_invite: prefs.case_invite,
        verification_complete: prefs.verification_complete,
        review_decision: prefs.review_decision,
        status_update: prefs.status_update,
        digest_frequency: prefs.digest_frequency,
        preferred_locale: prefs.preferred_locale,
      });
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    setMessage(null);

    const result = await NotificationService.updatePreferences(user.id, preferences);

    if (result.success) {
      setMessage({ type: "success", text: t("notifications.preferences_saved") });
    } else {
      setMessage({ type: "error", text: result.error || t("notifications.save_failed") });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("notifications.preferences")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t("notifications.preferences")}
        </CardTitle>
        <CardDescription>{t("notifications.preferences_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert variant={message.type === "success" ? "default" : "destructive"}>
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-enabled">{t("notifications.email_enabled")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("notifications.email_enabled_description")}
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={preferences.email_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, email_enabled: checked })
              }
            />
          </div>

          {preferences.email_enabled && (
            <>
              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-medium">{t("notifications.notification_types")}</p>

                <div className="flex items-center justify-between">
                  <Label htmlFor="case-invite">{t("notifications.case_invite")}</Label>
                  <Switch
                    id="case-invite"
                    checked={preferences.case_invite}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, case_invite: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="verification-complete">
                    {t("notifications.verification_complete")}
                  </Label>
                  <Switch
                    id="verification-complete"
                    checked={preferences.verification_complete}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, verification_complete: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="review-decision">{t("notifications.review_decision")}</Label>
                  <Switch
                    id="review-decision"
                    checked={preferences.review_decision}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, review_decision: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="status-update">{t("notifications.status_update")}</Label>
                  <Switch
                    id="status-update"
                    checked={preferences.status_update}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, status_update: checked })
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Label htmlFor="digest-frequency">{t("notifications.digest_frequency")}</Label>
                <Select
                  value={preferences.digest_frequency}
                  onValueChange={(value: "immediate" | "daily" | "weekly" | "never") =>
                    setPreferences({ ...preferences, digest_frequency: value })
                  }
                >
                  <SelectTrigger id="digest-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">{t("notifications.immediate")}</SelectItem>
                    <SelectItem value="daily">{t("notifications.daily")}</SelectItem>
                    <SelectItem value="weekly">{t("notifications.weekly")}</SelectItem>
                    <SelectItem value="never">{t("notifications.never")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Label htmlFor="preferred-locale">{t("notifications.preferred_locale")}</Label>
                <Select
                  value={preferences.preferred_locale || "auto"}
                  onValueChange={(value) =>
                    setPreferences({
                      ...preferences,
                      preferred_locale: value === "auto" ? null : (value as "en" | "sv" | "es"),
                    })
                  }
                >
                  <SelectTrigger id="preferred-locale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">{t("notifications.auto_detect")}</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sv">Svenska</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("notifications.locale_description")}
                </p>
              </div>
            </>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? t("common.saving") : t("common.save_changes")}
        </Button>
      </CardContent>
    </Card>
  );
}