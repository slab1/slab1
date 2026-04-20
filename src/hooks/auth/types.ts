import { UserRole } from '@/api/types';

export type BaseUser = {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar_url?: string;
  role: UserRole;
  phone_number?: string;
  address?: string;
  reservations?: any[];
  createdAt?: string;
  is_owner?: boolean;
};

export type UserType = BaseUser | null;

export type UserDetailsType = UserType;
