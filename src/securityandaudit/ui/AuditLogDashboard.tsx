import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Shield, FileText, Search, Download } from "lucide-react";
import { auditService } from "@/securityandaudit/AuditService";

export function AuditLogDashboard() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  
  // Filters
  const [actionFilter, setActionFilter] = useState<string>("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("");
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadAuditLogs(), loadIncidents()]);
  };

  const loadAuditLogs = async () => {
    const filters: any = {};
    if (actionFilter) filters.action = actionFilter;
    if (resourceTypeFilter) filters.resourceType = resourceTypeFilter;
    if (userIdFilter) filters.userId = userIdFilter;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const logs = await auditService.queryAuditLogs(filters);
    setAuditLogs(logs);
  };

  const loadIncidents = async () => {
    const data = await auditService.getSecurityIncidents();
    setIncidents(data);
  };

  const handleIncidentStatusChange = async (incidentId: string, status: string) => {
    await auditService.updateIncidentStatus(incidentId, status as any);
    await loadIncidents();
  };

  const exportAuditLogs = () => {
    const csv = [
      ["Timestamp", "User ID", "Action", "Resource Type", "Resource ID", "IP Address"].join(","),
      ...auditLogs.map(log => [
        new Date(log.created_at).toISOString(),
        log.user_id || "N/A",
        log.action,
        log.resource_type,
        log.resource_id,
        log.ip_address || "N/A",
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="container py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Security & Audit</h1>
            <p className="text-muted-foreground mt-1">
              Monitor access logs, security incidents, and compliance reviews
            </p>
          </div>
        </div>

        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="logs">Access Logs</TabsTrigger>
            <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Audit Log Filters
                </CardTitle>
                <CardDescription>
                  Search and filter access logs for compliance review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Action</label>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All actions</SelectItem>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="download">Download</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Resource Type</label>
                    <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All resources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All resources</SelectItem>
                        <SelectItem value="verification">Verification</SelectItem>
                        <SelectItem value="case">Case</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="profile">Profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">User ID</label>
                    <Input
                      placeholder="Filter by user ID"
                      value={userIdFilter}
                      onChange={(e) => setUserIdFilter(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={loadAuditLogs}>
                    <Search className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={exportAuditLogs}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Log Entries</CardTitle>
                <CardDescription>
                  {auditLogs.length} entries found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.user_id?.substring(0, 8) || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              log.action === "delete" ? "destructive" :
                              log.action === "edit" ? "default" : "secondary"
                            }>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{log.resource_type}</div>
                              <div className="font-mono text-xs text-muted-foreground">
                                {log.resource_id.substring(0, 8)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.ip_address || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Security Incidents
                </CardTitle>
                <CardDescription>
                  Track and manage security incidents and anomalies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              incident.severity === "critical" ? "destructive" :
                              incident.severity === "high" ? "destructive" :
                              incident.severity === "medium" ? "default" : "secondary"
                            }>
                              {incident.severity}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {incident.incident_type}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{incident.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(incident.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Select
                          value={incident.status}
                          onValueChange={(value) => handleIncidentStatusChange(incident.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="false_positive">False Positive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {incident.resolution_notes && (
                        <div className="text-sm bg-muted p-2 rounded">
                          <span className="font-medium">Resolution: </span>
                          {incident.resolution_notes}
                        </div>
                      )}
                    </div>
                  ))}
                  {incidents.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No security incidents reported
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}