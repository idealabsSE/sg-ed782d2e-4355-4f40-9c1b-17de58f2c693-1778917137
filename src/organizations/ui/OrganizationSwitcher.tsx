import { useState, useEffect } from "react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OrganizationService, type OrganizationWithRole } from "../OrganizationService";
import { CreateOrganizationDialog } from "./CreateOrganizationDialog";
import { cn } from "@/lib/utils";

interface OrganizationSwitcherProps {
  currentOrgId?: string;
  onOrgChange?: (orgId: string) => void;
}

export function OrganizationSwitcher({ currentOrgId, onOrgChange }: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const currentOrg = organizations.find((org) => org.id === currentOrgId);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgs = await OrganizationService.getUserOrganizations();
      setOrganizations(orgs);
      
      // Auto-select first org if none selected
      if (!currentOrgId && orgs.length > 0) {
        onOrgChange?.(orgs[0].id);
      }
    } catch (error) {
      console.error("Load organizations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSelect = (orgId: string) => {
    onOrgChange?.(orgId);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[240px] justify-between"
          >
            <Building2 className="mr-2 h-4 w-4" />
            {loading ? (
              "Loading..."
            ) : currentOrg ? (
              <span className="truncate">{currentOrg.name}</span>
            ) : (
              "Select organization"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder="Search organizations..." />
            <CommandList>
              <CommandEmpty>No organizations found.</CommandEmpty>
              <CommandGroup>
                {organizations.map((org) => (
                  <CommandItem
                    key={org.id}
                    value={org.id}
                    onSelect={() => handleOrgSelect(org.id)}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <div className="flex flex-col flex-1">
                      <span className="truncate">{org.name}</span>
                      <span className="text-xs text-muted-foreground">{org.role}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        currentOrgId === org.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadOrganizations}
      />
    </>
  );
}