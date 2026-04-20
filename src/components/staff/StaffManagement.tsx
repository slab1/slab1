import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/api/staff";
import { Staff, StaffRole } from "@/api/staff";
import { StaffProfile } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Plus, Download, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { STAFF_ROLES, getRoleLabel } from "@/api/staffRoles";
import { StaffForm } from "./StaffForm";
import { StaffDetails } from "./StaffDetails";
import { useToast } from "@/hooks/use-toast";
import { usePartnerSubscription } from "@/hooks/use-partner-subscription";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Shield, UserPlus, AlertCircle } from "lucide-react";

interface StaffManagementProps {
  restaurantId?: string;
}

function getRoleBadgeVariant(role: StaffRole): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case 'manager': return 'default';
    case 'chef': return 'secondary';
    case 'waiter': return 'outline';
    default: return 'outline';
  }
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" {
  switch (status) {
    case 'active': return 'default';
    case 'inactive': return 'secondary';
    case 'terminated': return 'destructive';
    default: return 'secondary';
  }
}

export default function StaffManagement({ restaurantId }: StaffManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const { data: staff = [], isLoading, error, refetch } = useQuery({
    queryKey: ["staff", restaurantId],
    queryFn: () => restaurantId ? staffApi.getByRestaurant(restaurantId) : staffApi.getAll(),
  });

  const { subscription: partnerSubscription, loading: subscriptionLoading } = usePartnerSubscription();
  const hasStaffManagement = partnerSubscription?.features?.includes('staff_management');

  if (!hasStaffManagement && !subscriptionLoading) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feature not available</AlertTitle>
          <AlertDescription>
            Staff management is a Premium feature. Your current plan ({partnerSubscription?.planName}) does not include this feature. 
            Please upgrade to access staff management tools.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentStaffCount = staff.length;
  const maxStaff = partnerSubscription?.maxStaff;
  const isLimitReached = maxStaff !== null && currentStaffCount >= (maxStaff || 0);

  const filteredStaff = staff.filter(member => {
    const firstName = member.profiles?.first_name || "";
    const lastName = member.profiles?.last_name || "";
    const email = member.profiles?.email || "";
    
    const matchesSearch = 
      `${firstName} ${lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === 'active' ? member.is_active : !member.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDelete = async (staffId: string) => {
    try {
      const success = await staffApi.delete(staffId);
      if (!success) throw new Error();
      toast({
        title: "Staff member deleted",
        description: "The staff member has been successfully removed.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportStaffData = () => {
    const csvContent = [
      "Name,Email,Role,Status,Created At",
      ...filteredStaff.map(member => {
        const name = `${member.profiles?.first_name || ""} ${member.profiles?.last_name || ""}`;
        const email = member.profiles?.email || "";
        const status = member.is_active ? "Active" : "Inactive";
        return `"${name}","${email}","${member.role}","${status}","${member.created_at}"`;
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "Staff data has been exported successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading staff data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <p className="text-destructive">Error loading staff data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Manage your team members and their details</p>
        </div>
        <div className="flex items-center gap-3">
          {maxStaff !== undefined && (
            <Card className="px-4 py-2 flex flex-col gap-1 min-w-[150px]">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Staff Limit</span>
                <span className={isLimitReached ? "text-destructive" : "text-primary"}>
                  {currentStaffCount} / {maxStaff || "∞"}
                </span>
              </div>
              <Progress 
                value={maxStaff ? (currentStaffCount / maxStaff) * 100 : 0} 
                className={`h-1.5 ${isLimitReached ? "bg-destructive/20" : ""}`}
              />
            </Card>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportStaffData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowForm(true)} disabled={isLimitReached}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {STAFF_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Staff Members ({filteredStaff.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {member.profiles?.first_name?.[0]}{member.profiles?.last_name?.[0]}
                        </span>
                      </div>
                      {member.profiles?.first_name} {member.profiles?.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{member.profiles?.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role as StaffRole)}>
                      {getRoleLabel(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? "default" : "secondary"}>
                      {member.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.created_at ? new Date(member.created_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={async () => {
                            const profile = await staffApi.getById(member.id);
                            // Cast to StaffProfile, filling in required fields
                            const staffProfile = {
                              id: member.id,
                              restaurant_id: member.restaurant_id,
                              staff_role: member.role || 'other',
                              employment_status: member.is_active ? 'active' : 'inactive',
                              hire_date: member.created_at || new Date().toISOString(),
                              first_name: member.profiles?.first_name || '',
                              last_name: member.profiles?.last_name || '',
                              email: member.profiles?.email || '',
                              phone: (profile as any)?.phone || '',
                              address: '',
                              is_active: member.is_active,
                              created_at: member.created_at,
                              updated_at: member.updated_at,
                            } as StaffProfile;
                            setSelectedStaff(staffProfile);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingStaff(member)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!member.is_active && (
                          <DropdownMenuItem 
                            onClick={() => {
                              toast({
                                title: "Invitation resent",
                                description: `A new invitation has been sent to ${member.profiles?.email}`,
                              });
                            }}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Invite
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(member.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredStaff.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No staff members found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forms and Dialogs */}
      <StaffForm
        open={showForm || !!editingStaff}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingStaff(null);
        }}
        staffMember={editingStaff}
        restaurantId={restaurantId}
        onSuccess={() => {
          setShowForm(false);
          setEditingStaff(null);
          refetch();
        }}
      />
      <StaffDetails
        open={!!selectedStaff}
        onOpenChange={(open) => !open && setSelectedStaff(null)}
        staffMember={selectedStaff}
      />
    </div>
  );
}
