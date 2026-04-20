
import { ReactNode, useEffect } from 'react';
import { useAuthSession } from '../hooks/auth/useAuthSession';
import { useUserData } from '../hooks/auth/useUserData';
import { useAuthActions } from '../hooks/auth/useAuthActions';
import { AuthLoadingSpinner } from '@/components/auth/AuthLoadingSpinner';
import { AuthContext } from '../contexts/AuthContext';

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { session, setSession, loading: sessionLoading, initialized } = useAuthSession();
  const { user, setUser, setupUserData, isUserDataLoading } = useUserData();
  const authActions = useAuthActions(user, setUser);

  // Set up user data when session changes
  useEffect(() => {
    if (session?.user) {
      console.log('AuthProvider: Session detected, triggering user data setup');
      setupUserData(session.user);
    } else if (initialized && !session) {
      console.log('AuthProvider: No session detected, clearing user data');
      setUser(null);
    }
  }, [session, setupUserData, setUser, initialized]);

  // Combine loading states for a comprehensive loading indicator
  // isUserDataLoading is important when we have a session but haven't finished fetching profile/role
  const isLoading = sessionLoading || (!!session && !user && isUserDataLoading);

  // Show loading state only during initial session check
  if (sessionLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        session,
        setSession,
        login: authActions.login,
        signup: authActions.signup,
        logout: authActions.logout,
        resetPassword: authActions.resetPassword,
        updatePassword: authActions.updatePassword,
        updateUserProfile: authActions.updateUserProfile,
        isLoading,
        isUserDataLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
