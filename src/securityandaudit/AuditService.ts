import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AuditLogInsert = Database["public"]["Tables"]["access_audit_log"]["Insert"];
type SecurityIncidentInsert = Database["public"]["Tables"]["security_incidents"]["Insert"];

export interface AuditLogEntry {
  action: "view" | "download" | "edit" | "delete" | "create";
  resourceType: "verification" | "case" | "document" | "profile";
  resourceId: string;
  metadata?: Record<string, any>;
}

export interface SecurityIncident {
  severity: "low" | "medium" | "high" | "critical";
  incidentType: "suspicious_access" | "unauthorized_attempt" | "data_breach" | "anomaly";
  description: string;
  affectedUserId?: string;
  metadata?: Record<string, any>;
}

class AuditService {
  private userAccessCount = new Map<string, number>();
  private readonly ANOMALY_THRESHOLD = 50; // Actions per minute
  private readonly ANOMALY_WINDOW = 60000; // 1 minute

  /**
   * Log an access event (client-side - calls server endpoint)
   */
  async logAccess(entry: AuditLogEntry): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get client info
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
      
      const payload: AuditLogInsert = {
        user_id: session?.user?.id || null,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        user_agent: userAgent,
        metadata: entry.metadata || null,
      };

      // Call Edge Function to log (server-side with service_role)
      const { error } = await supabase.functions.invoke("log-audit", {
        body: payload,
      });

      if (error) {
        console.error("Failed to log audit entry:", error);
      }

      // Check for anomalies
      if (session?.user?.id) {
        await this.checkForAnomalies(session.user.id);
      }
    } catch (error) {
      console.error("Audit logging error:", error);
    }
  }

  /**
   * Log multiple accesses in batch
   */
  async logBatch(entries: AuditLogEntry[]): Promise<void> {
    await Promise.all(entries.map(entry => this.logAccess(entry)));
  }

  /**
   * Check for suspicious access patterns
   */
  private async checkForAnomalies(userId: string): Promise<void> {
    const now = Date.now();
    const count = (this.userAccessCount.get(userId) || 0) + 1;
    this.userAccessCount.set(userId, count);

    // Reset counter after window
    setTimeout(() => {
      this.userAccessCount.delete(userId);
    }, this.ANOMALY_WINDOW);

    // If threshold exceeded, create security incident
    if (count > this.ANOMALY_THRESHOLD) {
      await this.reportIncident({
        severity: "high",
        incidentType: "anomaly",
        description: `Unusual access pattern detected: ${count} actions in 1 minute`,
        affectedUserId: userId,
        metadata: { actionCount: count, windowMs: this.ANOMALY_WINDOW },
      });
    }
  }

  /**
   * Report a security incident
   */
  async reportIncident(incident: SecurityIncident): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const payload: SecurityIncidentInsert = {
        severity: incident.severity,
        incident_type: incident.incidentType,
        description: incident.description,
        affected_user_id: incident.affectedUserId || null,
        detected_by: session?.user?.id || null,
        metadata: incident.metadata || null,
      };

      const { error } = await supabase
        .from("security_incidents")
        .insert(payload);

      if (error) {
        console.error("Failed to report security incident:", error);
      }
    } catch (error) {
      console.error("Security incident reporting error:", error);
    }
  }

  /**
   * Query audit logs (admin only)
   */
  async queryAuditLogs(filters: {
    userId?: string;
    action?: string;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLogInsert[]> {
    try {
      let query = supabase
        .from("access_audit_log")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.action) {
        query = query.eq("action", filters.action);
      }
      if (filters.resourceType) {
        query = query.eq("resource_type", filters.resourceType);
      }
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate.toISOString());
      }

      query = query.limit(filters.limit || 100);

      const { data, error } = await query;

      if (error) {
        console.error("Failed to query audit logs:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Audit log query error:", error);
      return [];
    }
  }

  /**
   * Get security incidents (admin only)
   */
  async getSecurityIncidents(status?: "open" | "investigating" | "resolved" | "false_positive") {
    try {
      let query = supabase
        .from("security_incidents")
        .select("*, affected_user:profiles!security_incidents_affected_user_id_fkey(full_name, email), detected_by_user:profiles!security_incidents_detected_by_fkey(full_name, email)")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch security incidents:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Security incidents fetch error:", error);
      return [];
    }
  }

  /**
   * Update security incident status
   */
  async updateIncidentStatus(
    incidentId: string,
    status: "open" | "investigating" | "resolved" | "false_positive",
    resolutionNotes?: string
  ): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "resolved" || status === "false_positive") {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = session?.user?.id;
        if (resolutionNotes) {
          updateData.resolution_notes = resolutionNotes;
        }
      }

      const { error } = await supabase
        .from("security_incidents")
        .update(updateData)
        .eq("id", incidentId);

      if (error) {
        console.error("Failed to update incident status:", error);
      }
    } catch (error) {
      console.error("Incident status update error:", error);
    }
  }
}

export const auditService = new AuditService();