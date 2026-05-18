/**
 * NotificationService
 * 
 * Manages locale-aware notification delivery with retry logic and user preferences.
 * Implements locale detection chain: user preference → org default → browser → English fallback.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type NotificationType = "case_invite" | "verification_complete" | "review_decision" | "status_update";
type NotificationLocale = "en" | "sv" | "es";
type NotificationStatus = "pending" | "sent" | "failed" | "cancelled";

interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  case_invite: boolean;
  verification_complete: boolean;
  review_decision: boolean;
  status_update: boolean;
  digest_frequency: "immediate" | "daily" | "weekly" | "never";
  preferred_locale: NotificationLocale | null;
}

interface NotificationTemplate {
  id: string;
  template_key: string;
  locale: NotificationLocale;
  subject: string;
  body_html: string;
  body_text: string;
  variables: string[] | null;
}

interface QueueNotificationParams {
  recipientUserId?: string;
  recipientEmail: string;
  notificationType: NotificationType;
  locale?: NotificationLocale;
  templateData: Record<string, string | number>;
  organizationId?: string;
}

export class NotificationService {
  /**
   * Detect the appropriate locale for a notification
   * Chain: user preference → org default → browser → English
   */
  static async detectLocale(
    userId?: string,
    organizationId?: string,
    browserLocale?: string
  ): Promise<NotificationLocale> {
    // 1. Check user preference
    if (userId) {
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("preferred_locale")
        .eq("user_id", userId)
        .single();

      if (prefs?.preferred_locale) {
        return prefs.preferred_locale as NotificationLocale;
      }
    }

    // 2. Check organization default
    if (organizationId) {
      const { data: org } = await supabase
        .from("organizations")
        .select("default_locale")
        .eq("id", organizationId)
        .single();

      if (org?.default_locale) {
        return org.default_locale as NotificationLocale;
      }
    }

    // 3. Use browser locale if valid
    if (browserLocale) {
      const locale = browserLocale.split("-")[0].toLowerCase();
      if (["en", "sv", "es"].includes(locale)) {
        return locale as NotificationLocale;
      }
    }

    // 4. Fallback to English
    return "en";
  }

  /**
   * Get user notification preferences
   */
  static async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching notification preferences:", error);
      return null;
    }

    return data as NotificationPreferences;
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(
    userId: string,
    preferences: Partial<Omit<NotificationPreferences, "id" | "user_id" | "created_at" | "updated_at">>
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (error) {
      console.error("Error updating notification preferences:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Check if user should receive a notification based on preferences
   */
  static async shouldNotify(
    userId: string,
    notificationType: NotificationType
  ): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    
    if (!prefs || !prefs.email_enabled) {
      return false;
    }

    // Check specific notification type preference
    return prefs[notificationType] === true;
  }

  /**
   * Get notification template with locale fallback
   */
  static async getTemplate(
    templateKey: string,
    locale: NotificationLocale
  ): Promise<NotificationTemplate | null> {
    // Try to get template in requested locale
    let { data, error } = await supabase
      .from("notification_templates")
      .select("*")
      .eq("template_key", templateKey)
      .eq("locale", locale)
      .single();

    // If not found, fallback to English
    if (error || !data) {
      const fallback = await supabase
        .from("notification_templates")
        .select("*")
        .eq("template_key", templateKey)
        .eq("locale", "en")
        .single();

      if (fallback.error || !fallback.data) {
        console.error("Template not found:", templateKey, locale);
        return null;
      }

      data = fallback.data;
    }

    return data as NotificationTemplate;
  }

  /**
   * Replace template variables
   */
  static interpolateTemplate(template: string, data: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  /**
   * Queue a notification for delivery
   */
  static async queueNotification(params: QueueNotificationParams): Promise<{
    success: boolean;
    queueId?: string;
    error?: string;
  }> {
    const {
      recipientUserId,
      recipientEmail,
      notificationType,
      templateData,
      organizationId,
    } = params;

    // Check user preferences if userId provided
    if (recipientUserId) {
      const shouldNotify = await this.shouldNotify(recipientUserId, notificationType);
      if (!shouldNotify) {
        return { success: true }; // Not an error, just skipped per preferences
      }
    }

    // Detect locale
    const locale = params.locale || await this.detectLocale(
      recipientUserId,
      organizationId,
      templateData.browserLocale as string
    );

    // Get template
    const template = await this.getTemplate(notificationType, locale);
    if (!template) {
      return { success: false, error: "Template not found" };
    }

    // Interpolate template
    const subject = this.interpolateTemplate(template.subject, templateData);
    const bodyHtml = this.interpolateTemplate(template.body_html, templateData);
    const bodyText = this.interpolateTemplate(template.body_text, templateData);

    // Insert into queue
    const { data, error } = await supabase
      .from("notification_queue")
      .insert({
        recipient_user_id: recipientUserId || null,
        recipient_email: recipientEmail,
        notification_type: notificationType,
        locale,
        subject,
        body_html: bodyHtml,
        body_text: bodyText,
        template_data: templateData,
        status: "pending",
        retry_count: 0,
        max_retries: 3,
        next_retry_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error queueing notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true, queueId: data.id };
  }

  /**
   * Get notification history for a user
   */
  static async getHistory(
    userId: string,
    limit: number = 50
  ): Promise<Database["public"]["Tables"]["notification_history"]["Row"][]> {
    const { data, error } = await supabase
      .from("notification_history")
      .select("*")
      .eq("recipient_user_id", userId)
      .order("sent_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notification history:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get notification queue status
   */
  static async getQueueStatus(): Promise<{
    pending: number;
    sent: number;
    failed: number;
  }> {
    const { data, error } = await supabase
      .from("notification_queue")
      .select("status");

    if (error) {
      console.error("Error fetching queue status:", error);
      return { pending: 0, sent: 0, failed: 0 };
    }

    const counts = data.reduce((acc, item) => {
      acc[item.status as NotificationStatus] = (acc[item.status as NotificationStatus] || 0) + 1;
      return acc;
    }, {} as Record<NotificationStatus, number>);

    return {
      pending: counts.pending || 0,
      sent: counts.sent || 0,
      failed: counts.failed || 0,
    };
  }
}