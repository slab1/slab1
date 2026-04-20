
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserDetailsDialog } from "./UserDetailsDialog";
import { UserRoleSelector } from "./UserRoleSelector";
import { UserRole } from "@/api/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface UserTableRowProps {
  user: UserWithRole;
  currentUserRole: string | undefined;
  manageableRoles: UserRole[];
  onViewDetails: (user: UserWithRole) => void;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  getRoleBadgeStyles: (role: UserRole | null) => string;
  isProcessing?: boolean;
}

export function UserTableRow({
  user,
  currentUserRole,
  manageableRoles,
  onViewDetails,
  onRoleChange,
  onToggleStatus,
  getRoleBadgeStyles,
  isProcessing = false,
}: UserTableRowProps) {
  const isActive = user.is_active ?? true;

  return (
    <TableRow key={user.user_id} className={`${!isActive ? "bg-slate-50 opacity-70" : ""} ${isProcessing ? "animate-pulse" : ""}`}>

      <TableCell className="font-medium">
        <div className="flex flex-col">
          <p>
            {user.profiles
              ? `${user.profiles.first_name || ""} ${user.profiles.last_name || ""}`.trim() || "No Name"
              : user.role 
                ? `${user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (No Profile)`
                : "Unknown User"}
          </p>
          {!isActive && (
            <span className="text-[10px] font-bold text-red-500 uppercase">Deactivated</span>
          )}
        </div>
      </TableCell>
      <TableCell>{user.profiles?.email || "No email"}</TableCell>
      <TableCell>
        <Badge
          className={getRoleBadgeStyles(user.role)}
          variant="outline"
        >
          {user.role
            ? user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            : "Customer"}
        </Badge>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {user.created_at && user.created_at !== "N/A" 
          ? new Date(user.created_at).toLocaleDateString() 
          : "N/A"}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => onToggleStatus(user.user_id, checked)}
                    className="data-[state=checked]:bg-green-500"
                    disabled={isProcessing}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isActive ? "Deactivate User" : "Activate User"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center gap-1">
            <UserDetailsDialog
              user={user}
              onViewDetails={onViewDetails}
              getRoleBadgeStyles={getRoleBadgeStyles}
            />
            <UserRoleSelector
              currentRole={user.role}
              userId={user.user_id}
              userRole={currentUserRole}
              manageableRoles={manageableRoles}
              onRoleChange={onRoleChange}
              disabled={isProcessing}
            />
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
