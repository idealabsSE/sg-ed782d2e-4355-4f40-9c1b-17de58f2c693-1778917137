import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationQueueItem {
  id: string;
  recipient_email: string;
  subject: string;
  body_html: string;
  body_text: string;
  notification_type: string;
  locale: string;
  retry_count: number;
  max_retries: number;
  template_data: Record<string, any>;
  recipient_user_id: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get pending notifications that are ready to send
    const { data: notifications, error: fetchError } = await supabaseClient
      .from("notification_queue")
      .select("*")
      .eq("status", "pending")
      .lte("next_retry_at", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending notifications", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each notification
    for (const notification of notifications as NotificationQueueItem[]) {
      try {
        // Send email using Supabase Auth's email service
        const { error: emailError } = await supabaseClient.auth.admin.inviteUserByEmail(
          notification.recipient_email,
          {
            data: {
              notification_type: notification.notification_type,
              custom_email: true,
            },
            redirectTo: `${Deno.env.get("PUBLIC_SITE_URL") || "https://xtrust.vercel.app"}/auth/callback`,
          }
        );

        // Note: The above is a workaround. In production, you'd use a proper email service.
        // For now, we'll use fetch to call an external email API or Supabase's email functions.
        
        // Simulate email sending (replace with actual email service in production)
        const emailSent = await sendEmail({
          to: notification.recipient_email,
          subject: notification.subject,
          html: notification.body_html,
          text: notification.body_text,
        });

        if (emailSent) {
          // Mark as sent and move to history
          await supabaseClient.from("notification_history").insert({
            notification_id: notification.id,
            recipient_user_id: notification.recipient_user_id,
            recipient_email: notification.recipient_email,
            notification_type: notification.notification_type,
            locale: notification.locale,
            subject: notification.subject,
            body_html: notification.body_html,
            body_text: notification.body_text,
            template_data: notification.template_data,
            sent_at: new Date().toISOString(),
            delivery_status: "delivered",
          });

          // Remove from queue
          await supabaseClient
            .from("notification_queue")
            .update({ status: "sent" })
            .eq("id", notification.id);

          successCount++;
        } else {
          throw new Error("Email delivery failed");
        }
      } catch (error) {
        // Handle retry logic with exponential backoff
        const newRetryCount = notification.retry_count + 1;
        
        if (newRetryCount >= notification.max_retries) {
          // Max retries reached, mark as failed
          await supabaseClient
            .from("notification_queue")
            .update({
              status: "failed",
              retry_count: newRetryCount,
              error_message: error.message,
            })
            .eq("id", notification.id);

          // Also log to history
          await supabaseClient.from("notification_history").insert({
            notification_id: notification.id,
            recipient_user_id: notification.recipient_user_id,
            recipient_email: notification.recipient_email,
            notification_type: notification.notification_type,
            locale: notification.locale,
            subject: notification.subject,
            body_html: notification.body_html,
            body_text: notification.body_text,
            template_data: notification.template_data,
            sent_at: new Date().toISOString(),
            delivery_status: "failed",
            error_message: error.message,
          });
        } else {
          // Schedule retry with exponential backoff
          const backoffMinutes = Math.pow(2, newRetryCount) * 5; // 5, 10, 20 minutes
          const nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);

          await supabaseClient
            .from("notification_queue")
            .update({
              retry_count: newRetryCount,
              next_retry_at: nextRetryAt.toISOString(),
              error_message: error.message,
            })
            .eq("id", notification.id);
        }

        failureCount++;
        console.error(`Failed to send notification ${notification.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Notification processing complete",
        total: notifications.length,
        success: successCount,
        failed: failureCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Email sending function (to be replaced with actual email service)
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  // In production, integrate with:
  // - SendGrid
  // - AWS SES
  // - Resend
  // - Postmark
  // - Or Supabase's native email service
  
  // For now, log the email
  console.log("Sending email:", {
    to: params.to,
    subject: params.subject,
    preview: params.text.substring(0, 100),
  });

  // Simulate success (replace with actual API call)
  return true;
}