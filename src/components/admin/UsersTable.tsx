
// React and Hooks
import { useState } from "react";

// React Query
import { useQuery } from "@tanstack/react-query";

// Notification
import { toast } from "sonner";

// API
import { userRoleApi } from "@/api/userRole";
import { roleApi } from "@/api/role";
import { isApiError } from "@/api/utils";

// Types
import { UserRole } from "@/api/types";

// Auth Hook
import { useAuth } from "@/hooks/use-auth";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { AlertCircle } from "lucide-react";

// Custom Components
import { UserSearchInput } from "./users/UserSearchInput";
import { UserTableRow } from "./users/UserTableRow";

type UserWithRole = {
  id: string;
  user_id: string;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    is_active?: boolean;
  } | null;
};

export function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const userData = await userRoleApi.getAllRoles();
      console.log("Fetched user data:", userData);
      
      // Handle potential error response using standardized type guard
      if (isApiError(userData)) {
        console.error("Error in getAllRoles:", userData.error);
        return [];
      }
      
      return (userData || []) as UserWithRole[];
    },
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (processingId) return;
    setProcessingId(userId);
    
    console.log(`Starting role change for user ${userId} to ${newRole}`);
    console.log(`Current user:`, currentUser);
    
    if (!currentUser || !currentUser.role) {
      toast.error("You don't have permission to update roles");
      setProcessingId(null);
      return;
    }

    // Special case: prevent superadmins from downgrading themselves (optional protection)
    if (
      userId === currentUser.id &&
      currentUser.role === "superadmin" &&
      newRole !== "superadmin"
    ) {
      console.log("Preventing superadmin self-downgrade");
      toast.error("Superadmins cannot downgrade their own role");
      setProcessingId(null);
      return;
    }

    try {
      console.log(`Checking if ${currentUser.role} can manage ${newRole}`);
      const canManage = await roleApi.canManageRole(
        currentUser.role as UserRole,
        newRole as UserRole
      );
      console.log(`Can manage result: ${canManage}`);

      if (!canManage) {
        toast.error(`You don't have permission to assign the ${newRole} role`);
        return;
      }

      console.log(`Updating role for user ${userId} to ${newRole}`);
      const result = await userRoleApi.updateRole(userId, newRole as UserRole);
      console.log("Update role result:", result);
      
      if (isApiError(result)) {
        console.error("Role update failed with error:", result.error);
        throw new Error(result.error);
      }
      
      console.log("Role update successful");
      toast.success(`User role updated to ${newRole}`);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
      refetch();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user role"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    if (processingId) return;
    setProcessingId(userId);

    if (!currentUser || !currentUser.role) {
      toast.error("You don't have permission to change user status");
      setProcessingId(null);
      return;
    }

    if (userId === currentUser.id) {
      toast.error("You cannot deactivate your own account");
      setProcessingId(null);
      return;
    }

    try {
      const result = await userRoleApi.toggleStatus(userId, isActive);
      
      if (isApiError(result)) {
        throw new Error(result.error);
      }

      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user status"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter((user: UserWithRole) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.profiles?.first_name || ""} ${
      user.profiles?.last_name || ""
    }`.toLowerCase();
    const email = user.profiles?.email?.toLowerCase() || "";

    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const handleViewDetails = (user: UserWithRole) => {
    setSelectedUser(user);
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading users: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  const manageableRoles = currentUser?.role
    ? roleApi.getManageableRoles(currentUser.role as UserRole)
    : [];

  console.log(`Current user role: ${currentUser?.role}`);
  console.log(`Manageable roles: ${manageableRoles.join(', ')}`);

  const getRoleBadgeStyles = (role: UserRole | null) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-200 text-purple-900";
      case "system_admin":
        return "bg-purple-100 text-purple-800";
      case "restaurant_owner":
        return "bg-blue-200 text-blue-900";
      case "restaurant_manager":
        return "bg-blue-100 text-blue-800";
      case "inventory_manager":
        return "bg-green-200 text-green-900";
      case "restaurant_staff":
        return "bg-green-100 text-green-800";
      case "customer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users & Permissions</CardTitle>
        <CardDescription>Manage platform users and their access roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <UserSearchInput 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">Role</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[120px]">Join Date</TableHead>
                  <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: UserWithRole) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      currentUserRole={currentUser?.role || undefined}
                      manageableRoles={manageableRoles}
                      getRoleBadgeStyles={getRoleBadgeStyles}
                      onRoleChange={handleRoleChange}
                      onToggleStatus={handleToggleStatus}
                      onViewDetails={handleViewDetails}
                      isProcessing={processingId === user.id}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {updateSuccess && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">
              User role updated successfully!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
