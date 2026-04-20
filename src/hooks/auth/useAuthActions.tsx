
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { profileApi } from '@/api/profile';
import { UserType, BaseUser } from './types';

export const useAuthActions = (user: UserType, setUser: (user: UserType) => void) => {
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Attempting login for email:', email);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before logging in. Check your inbox for a verification email.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          throw new Error(error.message || 'Login failed. Please try again.');
        }
      }

      console.log('Login successful for user:', data.user?.id);
    } catch (error) {
      console.error('Login process error:', error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      console.log('Attempting signup for email:', email);
      const fullName = `${firstName} ${lastName}`.trim();
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.');
        } else if (error.message.includes('Unable to validate email address')) {
          throw new Error('Please enter a valid email address.');
        } else {
          throw new Error(error.message || 'Signup failed. Please try again.');
        }
      }
      
      console.log('Signup successful, awaiting email verification for user:', data.user?.id);
      
      if (data.user && !data.session) {
        console.log('User created, verification email sent to:', email);
      }
    } catch (error) {
      console.error('Signup process error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('Attempting logout for user:', user?.id);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      console.log('Logout successful');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout process error:', error);
      toast.error('Error logging out. Please try again.');
    }
  }, [setUser, user?.id]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      console.log('Attempting password reset for email:', email);
      // IMPORTANT: This URL must be added to your Supabase project's "URL Configuration" -> "Redirect URLs" list.
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('Using redirect URL for password reset:', redirectUrl);
      console.log('Please ensure this URL is whitelisted in your Supabase project settings.');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        
        if (error.message.includes('For security purposes')) {
          throw new Error('For security purposes, password reset emails are rate limited. Please wait a few minutes before requesting another reset.');
        } else if (error.message.includes('Unable to validate email address')) {
          throw new Error('Please enter a valid email address.');
        } else {
          throw new Error(error.message || 'Failed to send password reset email. Please try again.');
        }
      }
      
      console.log('Password reset email sent successfully to:', email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Password reset process error:', error);
      toast.error('Error sending reset email. Please try again.');
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    try {
      console.log('Attempting password update for user:', user?.id);
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        console.error('Password update error:', error);
        
        if (error.message.includes('New password should be different')) {
          throw new Error('Your new password must be different from your current password.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 8 characters long.');
        } else {
          throw new Error(error.message || 'Failed to update password. Please try again.');
        }
      }
      
      console.log('Password updated successfully for user:', user?.id);
      toast.success('Password updated successfully!');
    } catch (error: any) {
      console.error('Password update process error:', error);
      throw error;
    }
  }, [user?.id]);

  const updateUserProfile = useCallback(async (profile: Partial<BaseUser>) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      console.log('Attempting profile update for user:', user.id);

      const fullName = profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone_number: profile.phone_number || null,
          address: profile.address,
          avatar_url: profile.avatar_url,
        },
      });
      
      if (authError) {
        console.error('Auth metadata update error:', authError);
        throw authError;
      }

      await profileApi.update(user.id, {
        first_name: profile.firstName || (profile.name?.split(' ')[0] ?? ''),
        last_name: profile.lastName || (profile.name?.split(' ').slice(1).join(' ') ?? ''),
        phone_number: profile.phone_number || (profile as any).phone || '',
        email: user.email,
        id: user.id,
        address: profile.address || '',
        avatar_url: profile.avatar_url || '',
        created_at: '',
        updated_at: ''
      } as any);

      setUser({
        ...user,
        ...profile,
        name: fullName,
      });

      console.log('Profile updated successfully for user:', user.id);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update process error:', error);
      toast.error('Error updating profile. Please try again.');
    }
  }, [user, setUser]);

  return {
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateUserProfile
  };
};
