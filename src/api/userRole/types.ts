
import { UserRole } from "../types";

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  restaurant_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleResponse {
  id: any;
  role: UserRole;
}

export interface UserWithRoleProfile {
  id: string;
  user_id: string;
  role: UserRole | null;
  restaurant_id?: string | null;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  last_login?: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    is_active?: boolean;
    last_login?: string | null;
  } | null;
}
