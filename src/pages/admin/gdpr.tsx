import { SEO } from "@/components/SEO";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GdprAdminDashboard } from "@/privacyandgdpr/ui/GdprAdminDashboard";

export default function GDPRPage() {
  return (
    <ProtectedRoute>
      <SEO title="GDPR Compliance" description="Data protection and compliance dashboard" />
      <GdprAdminDashboard />
    </ProtectedRoute>
  );
}