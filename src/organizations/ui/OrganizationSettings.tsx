import { useState, useEffect } from "react";
import { Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { OrganizationService, type OrganizationWithRole } from "../OrganizationService";
import { useToast } from "@/hooks/use-toast";

interface OrganizationSettingsProps {
  organizationId: string;
  canManageSettings: boolean;
}

export function OrganizationSettings({ organizationId, canManageSettings }: OrganizationSettingsProps) {
  const [organization, setOrganization] = useState<OrganizationWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [locale, setLocale] = useState<"en" | "sv" | "es">("en");
  const [brandColor, setBrandColor] = useState("#222222");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [caseUpdates, setCaseUpdates] = useState(true);
  const [memberJoined, setMemberJoined] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrganization();
  }, [organizationId]);

  const loadOrganization = async () => {
    try {
      const org = await OrganizationService.getOrganization(organizationId);
      setOrganization(org);
      setName(org.name);
      setLocale(org.locale as "en" | "sv" | "es");
      
      const settings = org.settings as any || {};
      setEmailNotifications(settings.email_notifications !== false);
      setCaseUpdates(settings.case_updates !== false);
      setMemberJoined(settings.member_joined !== false);
      
      const branding = org.branding as any || {};
      setBrandColor(branding.primary_color || "#222222");
    } catch (error) {
      console.error("Load organization error:", error);
      toast({
        title: "Failed to load organization",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canManageSettings) return;
    setSaving(true);

    try {
      await OrganizationService.updateOrganization(organizationId, {
        name,
        locale,
        settings: {
          email_notifications: emailNotifications,
          case_updates: caseUpdates,
          member_joined: memberJoined,
        },
        branding: {
          primary_color: brandColor,
        },
      });

      toast({
        title: "Settings saved",
        description: "Organization settings have been updated successfully.",
      });

      loadOrganization();
    } catch (error) {
      console.error("Save settings error:", error);
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading settings...</div>;
  }

  if (!organization) {
    return <div className="text-center py-8 text-muted-foreground">Organization not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic organization information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canManageSettings}
              placeholder="Acme Property Management"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="org-slug">URL Slug</Label>
            <Input
              id="org-slug"
              value={organization.slug}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Slug cannot be changed after creation
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="org-locale">Default Language</Label>
            <Select
              value={locale}
              onValueChange={(value: "en" | "sv" | "es") => setLocale(value)}
              disabled={!canManageSettings}
            >
              <SelectTrigger id="org-locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sv">Svenska</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Default language for all organization members
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize the appearance of your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="brand-color">Primary Brand Color</Label>
            <div className="flex gap-2">
              <Input
                id="brand-color"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                disabled={!canManageSettings}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                disabled={!canManageSettings}
                placeholder="#222222"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Used for buttons, links, and accents throughout the platform
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Control email notifications for your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about organization activity
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              disabled={!canManageSettings}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="case-updates">Case Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when cases are created or updated
              </p>
            </div>
            <Switch
              id="case-updates"
              checked={caseUpdates}
              onCheckedChange={setCaseUpdates}
              disabled={!canManageSettings || !emailNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="member-joined">New Members</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new members join the organization
              </p>
            </div>
            <Switch
              id="member-joined"
              checked={memberJoined}
              onCheckedChange={setMemberJoined}
              disabled={!canManageSettings || !emailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {canManageSettings && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      )}
    </div>
  );
}