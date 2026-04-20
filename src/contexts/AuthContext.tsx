import { createContext, ReactNode } from 'react';
import { UserType, BaseUser } from '../hooks/auth/types';
import { Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateUserProfile: (profile: Partial<BaseUser>) => Promise<void>;
  isLoading: boolean;
  isUserDataLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  session: null,
  setSession: () => {},
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  updateUserProfile: async () => {},
  isLoading: true,
  isUserDataLoading: false
});