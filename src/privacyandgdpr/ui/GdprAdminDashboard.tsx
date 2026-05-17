import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Clock, FileText, Shield, Users, Database, AlertTriangle } from "lucide-react";
import { gdprService } from "@/services/gdprService";
import { useTranslation } from "@/hooks/useTranslation";
import type { Tables } from "@/integrations/supabase/types";

type DSAR = Tables<"data_subject_requests">;
type Vendor = Tables<"vendor_registry">;
type RetentionPolicy = Tables<"retention_policies">;

export function GdprAdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<{
    dsar_total: number;
    dsar_pending: number;
    dsar_overdue: number;
    vendors_total: number;
    vendors_without_dpa: number;
    retention_policies: number;
  } | null>(null);
  const [dsars, setDsars] = useState<DSAR[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [dsarFormOpen, setDsarFormOpen] = useState(false);

  // DSAR form state
  const [dsarForm, setDsarForm] = useState({
    request_type: "access" as const,
    requester_email: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, dsarsData, vendorsData, policiesData] = await Promise.all([
        gdprService.getComplianceStats(),
        gdprService.listDSARs(),
        gdprService.listVendors({ status: "active" }),
        gdprService.listRetentionPolicies(),
      ]);
      setStats(statsData);
      setDsars(dsarsData);
      setVendors(vendorsData);
      setPolicies(policiesData);
    } catch (error) {
      console.error("Failed to load GDPR data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDSAR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await gdprService.submitDSAR(dsarForm);
      setDsarFormOpen(false);
      setDsarForm({ request_type: "access", requester_email: "", notes: "" });
      loadData();
    } catch (error) {
      console.error("Failed to submit DSAR:", error);
    }
  };

  const handleUpdateDSAR = async (id: string, status: "pending" | "in_progress" | "completed" | "rejected") => {
    try {
      await gdprService.updateDSARStatus(id, status);
      loadData();
    } catch (error) {
      console.error("Failed to update DSAR:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; icon: typeof Clock }> = {
      pending: { variant: "secondary", icon: Clock },
      in_progress: { variant: "default", icon: AlertCircle },
      completed: { variant: "default", icon: CheckCircle2 },
      rejected: { variant: "destructive", icon: AlertTriangle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center py-24">
          <div className="text-muted-foreground">Loading GDPR dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">GDPR Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-2">Monitor data subject requests, vendor compliance, and retention policies</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Subject Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.dsar_total || 0}</div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>{stats?.dsar_pending || 0} pending</span>
                {(stats?.dsar_overdue || 0) > 0 && (
                  <span className="text-destructive font-medium">{stats?.dsar_overdue} overdue</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.vendors_total || 0}</div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {(stats?.vendors_without_dpa || 0) > 0 && (
                  <span className="text-destructive font-medium">{stats?.vendors_without_dpa} without DPA</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Policies</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.retention_policies || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Active policies</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dsars" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dsars">Data Subject Requests</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Registry</TabsTrigger>
            <TabsTrigger value="retention">Retention Policies</TabsTrigger>
          </TabsList>

          {/* DSARs Tab */}
          <TabsContent value="dsars" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Data Subject Access Requests</h2>
              <Dialog open={dsarFormOpen} onOpenChange={setDsarFormOpen}>
                <DialogTrigger asChild>
                  <Button>Log New DSAR</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Data Subject Access Request</DialogTitle>
                    <DialogDescription>Record a new GDPR request from a data subject</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitDSAR} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="request_type">Request Type</Label>
                      <Select
                        value={dsarForm.request_type}
                        onValueChange={(value: typeof dsarForm.request_type) =>
                          setDsarForm({ ...dsarForm, request_type: value })
                        }
                      >
                        <SelectTrigger id="request_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="access">Access (Article 15)</SelectItem>
                          <SelectItem value="erasure">Erasure (Article 17)</SelectItem>
                          <SelectItem value="portability">Portability (Article 20)</SelectItem>
                          <SelectItem value="rectification">Rectification (Article 16)</SelectItem>
                          <SelectItem value="restriction">Restriction (Article 18)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requester_email">Requester Email</Label>
                      <Input
                        id="requester_email"
                        type="email"
                        required
                        value={dsarForm.requester_email}
                        onChange={(e) => setDsarForm({ ...dsarForm, requester_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        rows={3}
                        value={dsarForm.notes}
                        onChange={(e) => setDsarForm({ ...dsarForm, notes: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Submit DSAR
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dsars.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No data subject requests logged
                      </TableCell>
                    </TableRow>
                  ) : (
                    dsars.map((dsar) => (
                      <TableRow key={dsar.id}>
                        <TableCell className="font-medium capitalize">{dsar.request_type}</TableCell>
                        <TableCell>{dsar.requester_email}</TableCell>
                        <TableCell>{getStatusBadge(dsar.status)}</TableCell>
                        <TableCell>{new Date(dsar.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {new Date(dsar.deadline) < new Date() && dsar.status !== "completed" ? (
                            <span className="text-destructive font-medium">
                              {new Date(dsar.deadline).toLocaleDateString()}
                            </span>
                          ) : (
                            new Date(dsar.deadline).toLocaleDateString()
                          )}
                        </TableCell>
                        <TableCell>
                          {dsar.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateDSAR(dsar.id, "in_progress")}>
                              Start
                            </Button>
                          )}
                          {dsar.status === "in_progress" && (
                            <Button size="sm" onClick={() => handleUpdateDSAR(dsar.id, "completed")}>
                              Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-4">
            <h2 className="text-xl font-semibold">Third-Party Processor Registry</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>EU Based</TableHead>
                    <TableHead>DPA Status</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.vendor_name}</TableCell>
                      <TableCell className="text-sm">{vendor.service_provided}</TableCell>
                      <TableCell className="capitalize">{vendor.vendor_type}</TableCell>
                      <TableCell>{vendor.eu_based ? <CheckCircle2 className="h-4 w-4 text-accent" /> : "No"}</TableCell>
                      <TableCell>
                        {vendor.dpa_signed ? (
                          <Badge variant="default" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Signed
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Missing</Badge>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{vendor.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Retention Tab */}
          <TabsContent value="retention" className="space-y-4">
            <h2 className="text-xl font-semibold">Data Retention Policies</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Category</TableHead>
                    <TableHead>Retention Period</TableHead>
                    <TableHead>Legal Basis</TableHead>
                    <TableHead>Deletion Method</TableHead>
                    <TableHead>Last Sweep</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium capitalize">{policy.data_category.replace("_", " ")}</TableCell>
                      <TableCell>{Math.floor(policy.retention_period_days / 365)} years</TableCell>
                      <TableCell className="capitalize">{policy.legal_basis.replace("_", " ")}</TableCell>
                      <TableCell className="capitalize">{policy.deletion_method.replace("_", " ")}</TableCell>
                      <TableCell>
                        {policy.last_sweep_at ? new Date(policy.last_sweep_at).toLocaleDateString() : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}