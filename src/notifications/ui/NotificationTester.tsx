/**
 * NotificationTester Component
 * 
 * Admin interface for testing and previewing notification templates
 */

import { useState } from "react";
import { NotificationService } from "../NotificationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertCircle, Send, Eye } from "lucide-react";

type NotificationType = "case_invite" | "verification_complete" | "review_decision" | "status_update";
type NotificationLocale = "en" | "sv" | "es";

export function NotificationTester() {
  const [notificationType, setNotificationType] = useState<NotificationType>("case_invite");
  const [locale, setLocale] = useState<NotificationLocale>("en");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [templateData, setTemplateData] = useState({
    recipientName: "John Doe",
    caseNumber: "12345",
    inviterName: "Jane Smith",
    caseType: "Property Verification",
    actionUrl: "https://xtrust.vercel.app/cases/12345",
  });
  const [preview, setPreview] = useState<{ subject: string; html: string; text: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const handlePreview = async () => {
    setMessage(null);
    
    const template = await NotificationService.getTemplate(notificationType, locale);
    if (!template) {
      setMessage({ type: "error", text: "Template not found" });
      return;
    }

    const subject = NotificationService.interpolateTemplate(template.subject, templateData);
    const html = NotificationService.interpolateTemplate(template.body_html, templateData);
    const text = NotificationService.interpolateTemplate(template.body_text, templateData);

    setPreview({ subject, html, text });
  };

  const handleSend = async () => {
    if (!recipientEmail) {
      setMessage({ type: "error", text: "Please enter recipient email" });
      return;
    }

    setSending(true);
    setMessage(null);

    const result = await NotificationService.queueNotification({
      recipientEmail,
      notificationType,
      locale,
      templateData,
    });

    if (result.success) {
      setMessage({ type: "success", text: `Notification queued successfully (ID: ${result.queueId})` });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to queue notification" });
    }

    setSending(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Tester</CardTitle>
        <CardDescription>Test and preview notification templates in all languages</CardDescription>
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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="notification-type">Notification Type</Label>
            <Select
              value={notificationType}
              onValueChange={(value: NotificationType) => setNotificationType(value)}
            >
              <SelectTrigger id="notification-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="case_invite">Case Invite</SelectItem>
                <SelectItem value="verification_complete">Verification Complete</SelectItem>
                <SelectItem value="review_decision">Review Decision</SelectItem>
                <SelectItem value="status_update">Status Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locale">Language</Label>
            <Select value={locale} onValueChange={(value: NotificationLocale) => setLocale(value)}>
              <SelectTrigger id="locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sv">Svenska</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient-email">Recipient Email (for sending)</Label>
          <Input
            id="recipient-email"
            type="email"
            placeholder="test@example.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Template Data (JSON)</Label>
          <Textarea
            value={JSON.stringify(templateData, null, 2)}
            onChange={(e) => {
              try {
                setTemplateData(JSON.parse(e.target.value));
              } catch (err) {
                // Invalid JSON, ignore
              }
            }}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePreview} variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSend} disabled={sending || !recipientEmail} className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send Test"}
          </Button>
        </div>

        {preview && (
          <Tabs defaultValue="html" className="border-t pt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="subject">Subject</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="text">Plain Text</TabsTrigger>
            </TabsList>
            <TabsContent value="subject" className="space-y-2">
              <div className="rounded-md border p-4 bg-muted/50">
                <p className="font-medium">{preview.subject}</p>
              </div>
            </TabsContent>
            <TabsContent value="html" className="space-y-2">
              <div className="rounded-md border p-4 bg-muted/50 max-h-96 overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: preview.html }} />
              </div>
            </TabsContent>
            <TabsContent value="text" className="space-y-2">
              <div className="rounded-md border p-4 bg-muted/50 max-h-96 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm">{preview.text}</pre>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}