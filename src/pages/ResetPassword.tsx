
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

type ValidationStatus = 'validating' | 'valid' | 'invalid' | 'success';

export default function ResetPassword() {
  const { updatePassword, session, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ValidationStatus>('validating');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    console.log('ResetPassword auth state:', { isAuthLoading, session: !!session });

    // The Supabase client library handles the password reset token from the URL fragment
    // automatically. It establishes a temporary session. We listen for that session.
    if (!isAuthLoading) {
      if (session) {
        console.log('ResetPassword: Session found, link is valid.');
        setStatus('valid');
      } else {
        console.error('ResetPassword: No session found after auth loaded. Link is invalid or expired.');
        setStatus('invalid');
      }
    }
  }, [session, isAuthLoading]);

  const handleRetry = () => {
    navigate('/forgot-password');
  };

  async function onSubmit(data: ResetPasswordValues) {
    if (status !== 'valid') {
      setFormError('Invalid session. Please request a new password reset email.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    
    try {
      await updatePassword(data.password);
      
      console.log('Password reset successful');
      setStatus('success');
      toast.success('Password has been reset successfully!');
      
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successfully! You can now log in with your new password.' 
          }
        });
      }, 3000);
    } catch (error: any) {
      console.error('Update password error:', error);
      const errorMessage = error.message || 'Failed to reset password. Please try again.';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'validating') {
    return (
      <div className="container max-w-md mx-auto py-10 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
            <p className="text-muted-foreground">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="container max-w-md mx-auto py-10 px-4">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-green-700">Password Reset Complete!</CardTitle>
            <CardDescription>
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  const validationError = status === 'invalid' ? 'Invalid or expired password reset link. The link may have been used already.' : null;

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>
            Create a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthErrorBoundary 
            error={validationError || formError} 
            onRetry={handleRetry}
            title="Password Reset Error"
          >
            {status === 'valid' && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="Enter new password"
                              type={showPassword ? "text" : "password"}
                              className="pl-10"
                              disabled={isSubmitting}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isSubmitting}
                            >
                              {showPassword ? 
                                <EyeOff className="h-5 w-5 text-muted-foreground" /> : 
                                <Eye className="h-5 w-5 text-muted-foreground" />
                              }
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                        <PasswordStrengthIndicator password={field.value} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="Confirm new password"
                              type={showConfirmPassword ? "text" : "password"}
                              className="pl-10"
                              disabled={isSubmitting}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={isSubmitting}
                            >
                              {showConfirmPassword ? 
                                <EyeOff className="h-5 w-5 text-muted-foreground" /> : 
                                <Eye className="h-5 w-5 text-muted-foreground" />
                              }
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Resetting password..." : "Reset password"}
                  </Button>
                </form>
              </Form>
            )}
          </AuthErrorBoundary>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate('/login')} disabled={isSubmitting}>
            Back to login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
