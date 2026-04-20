
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/api/types";

interface UserRoleSelectorProps {
  currentRole: UserRole | null;
  userId: string;
  userRole: string | undefined;
  manageableRoles: UserRole[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
  disabled?: boolean;
}

const ROLES: UserRole[] = [
  "customer",
  "restaurant_staff",
  "inventory_manager",
  "restaurant_manager",
  "restaurant_owner",
  "system_admin",
  "superadmin",
];

const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Customer",
  restaurant_staff: "Restaurant Staff",
  inventory_manager: "Inventory Manager",
  restaurant_manager: "Restaurant Manager",
  restaurant_owner: "Restaurant Owner",
  admin: "Admin",
  system_admin: "System Admin",
  superadmin: "Super Admin",
};

export function UserRoleSelector({ 
  currentRole, 
  userId, 
  userRole, 
  manageableRoles, 
  onRoleChange,
  disabled = false
}: UserRoleSelectorProps) {
  if (!userRole) {
    return (
      <Button variant="outline" disabled className="w-[130px]">
        No permission
      </Button>
    );
  }

  return (
    <Select
      value={currentRole || ""}
      onValueChange={(value) => onRoleChange(userId, value as UserRole)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((role) => {
          // For superadmins, show all roles as selectable
          // For others, only show manageable roles
          const canAssign = userRole === 'superadmin' || manageableRoles.includes(role);
          
          return (
            <SelectItem
              key={role}
              value={role}
              disabled={!canAssign}
            >
              {ROLE_LABELS[role]}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
