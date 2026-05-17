import { SEO } from "@/components/SEO";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuditLogDashboard } from "@/securityandaudit/ui/AuditLogDashboard";

export default function AuditPage() {
  return (
    <ProtectedRoute>
      <SEO
        title="Audit Logs - X Trust Admin"
        description="Security audit logs and incident management"
      />
      <AuditLogDashboard />
    </ProtectedRoute>
  );
}