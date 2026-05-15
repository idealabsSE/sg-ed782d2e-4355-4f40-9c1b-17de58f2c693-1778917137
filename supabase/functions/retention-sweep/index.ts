import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RetentionPolicy {
  id: string;
  data_category: string;
  retention_period_days: number;
  deletion_method: "anonymize" | "hard_delete";
  is_active: boolean;
  table_name: string;
  timestamp_column: string;
}

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active retention policies
    const { data: policies, error: policiesError } = await supabase
      .from("retention_policies")
      .select("*")
      .eq("is_active", true);

    if (policiesError) throw policiesError;

    const results = [];

    for (const policy of policies as RetentionPolicy[]) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retention_period_days);

      // Find records older than retention period
      const { data: expiredRecords, error: queryError } = await supabase
        .from(policy.table_name)
        .select("id")
        .lt(policy.timestamp_column, cutoffDate.toISOString());

      if (queryError) {
        console.error(`Error querying ${policy.table_name}:`, queryError);
        continue;
      }

      if (!expiredRecords || expiredRecords.length === 0) {
        results.push({
          policy: policy.data_category,
          action: "no_records_to_process",
          count: 0,
        });
        continue;
      }

      const expiredIds = expiredRecords.map((r: { id: string }) => r.id);

      if (policy.deletion_method === "hard_delete") {
        // Hard delete records
        const { error: deleteError } = await supabase
          .from(policy.table_name)
          .delete()
          .in("id", expiredIds);

        if (deleteError) {
          console.error(`Error deleting from ${policy.table_name}:`, deleteError);
          results.push({
            policy: policy.data_category,
            action: "hard_delete_failed",
            error: deleteError.message,
          });
          continue;
        }

        results.push({
          policy: policy.data_category,
          action: "hard_deleted",
          count: expiredIds.length,
        });
      } else if (policy.deletion_method === "anonymize") {
        // Anonymize records (implementation depends on table structure)
        // For most tables, we'll set identifying fields to null or anonymized values
        const anonymizeData: Record<string, string | null> = {};

        // Common anonymization patterns
        if (policy.table_name === "profiles") {
          anonymizeData.email = `anonymized_${Date.now()}@deleted.local`;
          anonymizeData.full_name = "Deleted User";
          anonymizeData.avatar_url = null;
        } else if (policy.table_name === "audit_logs") {
          anonymizeData.user_id = null;
          anonymizeData.ip_address = "0.0.0.0";
        } else if (policy.table_name === "consent_records") {
          anonymizeData.ip_address = "0.0.0.0";
          anonymizeData.user_agent = "anonymized";
        }

        if (Object.keys(anonymizeData).length > 0) {
          const { error: updateError } = await supabase
            .from(policy.table_name)
            .update(anonymizeData)
            .in("id", expiredIds);

          if (updateError) {
            console.error(`Error anonymizing ${policy.table_name}:`, updateError);
            results.push({
              policy: policy.data_category,
              action: "anonymize_failed",
              error: updateError.message,
            });
            continue;
          }

          results.push({
            policy: policy.data_category,
            action: "anonymized",
            count: expiredIds.length,
          });
        }
      }

      // Update last_sweep_at timestamp
      await supabase
        .from("retention_policies")
        .update({ last_sweep_at: new Date().toISOString() })
        .eq("id", policy.id);
    }

    // Log the sweep execution
    await supabase.from("audit_logs").insert({
      event_type: "retention_sweep",
      actor_type: "system",
      resource_type: "retention_policy",
      action: "automated_sweep",
      metadata: { results, executed_at: new Date().toISOString() },
      ip_address: "system",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Retention sweep completed",
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Retention sweep error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});