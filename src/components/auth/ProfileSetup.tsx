
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { userRoleApi } from '@/api/userRole';
import { UserRole } from '@/api/types';

interface ProfileSetupProps {
  onComplete?: () => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user } = useAuth();
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateUserRole = async (role: UserRole) => {
    if (!user) {
      setError('You must be logged in to update your role');
      return;
    }

    setIsUpdatingRole(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await userRoleApi.updateRole(user.id, role);
      if (result && 'error' in result) {
        throw new Error(result.error);
      }
      
      setSuccess(`Role updated to ${role} successfully!`);
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please sign in to set up your profile.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Profile Setup
        </CardTitle>
        <CardDescription>
          Configure your account permissions and role
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Logged in as {user.email}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Current Role: {user.role}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {user.role === 'customer' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Would you like to upgrade your account to access additional features?
            </p>
            
            <div className="grid gap-2">
              <Button 
                onClick={() => updateUserRole('system_admin')}
                disabled={isUpdatingRole}
                variant="outline"
                className="justify-start"
              >
                {isUpdatingRole ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Upgrade to System Admin'
                )}
              </Button>
              
              <Button 
                onClick={() => updateUserRole('restaurant_manager')}
                disabled={isUpdatingRole}
                variant="outline"
                className="justify-start"
              >
                {isUpdatingRole ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Upgrade to Restaurant Manager'
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              System Admin: Full system access including user management<br/>
              Restaurant Manager: Restaurant management and staff oversight
            </p>
          </div>
        )}

        {(user.role === 'system_admin' || user.role === 'restaurant_manager' || user.role === 'superadmin') && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You have {user.role} access! You can now manage the system and access advanced features.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
