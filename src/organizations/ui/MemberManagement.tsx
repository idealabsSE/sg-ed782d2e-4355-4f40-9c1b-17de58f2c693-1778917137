import { useState, useEffect } from "react";
import { Mail, MoreVertical, Shield, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrganizationService, type MemberWithProfile, type OrganizationRole } from "../OrganizationService";
import { useToast } from "@/hooks/use-toast";

interface MemberManagementProps {
  organizationId: string;
  canManageMembers: boolean;
}

export function MemberManagement({ organizationId, canManageMembers }: MemberManagementProps) {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    try {
      const [membersData, rolesData] = await Promise.all([
        OrganizationService.getOrganizationMembers(organizationId),
        OrganizationService.getOrganizationRoles(organizationId),
      ]);
      setMembers(membersData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Load members error:", error);
      toast({
        title: "Failed to load members",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);

    try {
      await OrganizationService.inviteMember(organizationId, inviteEmail, inviteRoleId);
      toast({
        title: "Invitation sent",
        description: `Invited ${inviteEmail} to the organization.`,
      });
      setInviteEmail("");
      setInviteRoleId("");
      setShowInviteDialog(false);
      loadData();
    } catch (error) {
      console.error("Invite error:", error);
      toast({
        title: "Failed to invite member",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this organization?`)) return;

    try {
      await OrganizationService.removeMember(memberId);
      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the organization.`,
      });
      loadData();
    } catch (error) {
      console.error("Remove member error:", error);
      toast({
        title: "Failed to remove member",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (memberId: string, newRoleId: string, memberName: string) => {
    try {
      await OrganizationService.updateMemberRole(memberId, newRoleId);
      toast({
        title: "Role updated",
        description: `Updated role for ${memberName}.`,
      });
      loadData();
    } catch (error) {
      console.error("Update role error:", error);
      toast({
        title: "Failed to update role",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading members...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage who has access to this organization</CardDescription>
            </div>
            {canManageMembers && (
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                {canManageMembers && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.user.full_name || "No name"}
                  </TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>
                    {canManageMembers ? (
                      <Select
                        value={member.role_id}
                        onValueChange={(value) => handleRoleChange(member.id, value, member.user.full_name || member.user.email)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue>{member.role.name}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary">{member.role.name}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>
                    {member.joined_at
                      ? new Date(member.joined_at).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  {canManageMembers && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRemove(member.id, member.user.full_name || member.user.email)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join this organization.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRoleId} onValueChange={setInviteRoleId} required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)} disabled={inviting}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviting || !inviteEmail || !inviteRoleId}>
                <Mail className="mr-2 h-4 w-4" />
                {inviting ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}