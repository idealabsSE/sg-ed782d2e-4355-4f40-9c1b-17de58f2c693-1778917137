import { SEO } from "@/components/SEO";
import { AdminRoute } from "@/components/AdminRoute";
import { GdprAdminDashboard } from "@/privacyandgdpr/ui/GdprAdminDashboard";

export default function GDPRPage() {
  return (
    <AdminRoute>
      <SEO title="GDPR Compliance" description="Data protection and compliance dashboard" />
      <GdprAdminDashboard />
    </AdminRoute>
  );
}