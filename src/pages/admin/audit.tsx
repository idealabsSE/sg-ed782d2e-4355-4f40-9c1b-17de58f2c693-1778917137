import { SEO } from "@/components/SEO";
import { AdminRoute } from "@/components/AdminRoute";
import { AuditLogDashboard } from "@/securityandaudit/ui/AuditLogDashboard";

export default function AuditPage() {
  return (
    <AdminRoute>
      <SEO
        title="Audit Logs - X Trust Admin"
        description="Security audit logs and incident management"
      />
      <AuditLogDashboard />
    </AdminRoute>
  );
}