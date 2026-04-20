
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';

type VerificationState = 'loading' | 'success' | 'error' | 'already_verified';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationState, setVerificationState] = useState<VerificationState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [autoLoginCountdown, setAutoLoginCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token hash and type from URL parameters
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!token_hash || !type) {
          setError('Invalid verification link. Please check your email and try again.');
          setVerificationState('error');
          setIsLoading(false);
          return;
        }

        console.log('Verifying email with token:', { token_hash: token_hash.substring(0, 10) + '...', type });

        // Verify the token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          console.error('Verification error:', error);
          
          // Handle specific error cases
          if (error.message.includes('expired')) {
            setError('This verification link has expired. Please sign up again to receive a new verification email.');
          } else if (error.message.includes('invalid')) {
            setError('This verification link is invalid. Please check your email or sign up again.');
          } else if (error.message.includes('already been verified')) {
            setVerificationState('already_verified');
            setError('This email has already been verified. You can now log in to your account.');
          } else {
            setError(error.message || 'Failed to verify email. The link may have expired.');
          }
          
          if (verificationState !== 'already_verified') {
            setVerificationState('error');
          }
        } else {
          console.log('Email verification successful:', data);
          setVerificationState('success');
          setUserEmail(data.user?.email || '');
          toast.success('Email verified successfully! You will be automatically logged in.');
          
          // Log the verification event
          console.log('Email verification completed for user:', data.user?.id);
        }
      } catch (err) {
        console.error('Unexpected verification error:', err);
        setError('An unexpected error occurred during verification. Please try again later.');
        setVerificationState('error');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, verificationState]);

  const handleContinueToLogin = useCallback(() => {
    navigate('/login', { 
      state: { 
        message: 'Email verified successfully! You can now log in to your account.',
        email: userEmail
      }
    });
  }, [navigate, userEmail]);

  // Auto-login countdown for successful verification
  useEffect(() => {
    if (verificationState === 'success' && autoLoginCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoLoginCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (verificationState === 'success' && autoLoginCountdown === 0) {
      handleContinueToLogin();
    }
  }, [verificationState, autoLoginCountdown, handleContinueToLogin]);

  const handleResendVerification = () => {
    navigate('/signup', {
      state: {
        message: 'Please sign up again to receive a new verification email.'
      }
    });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const renderContent = () => {
    switch (verificationState) {
      case 'loading':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Verifying Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </>
        );

      case 'success':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You will be automatically redirected to login.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {userEmail && (
                <p className="text-sm text-muted-foreground">
                  Verified email: <span className="font-medium text-primary">{userEmail}</span>
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Redirecting in {autoLoginCountdown} seconds...</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={handleContinueToLogin} className="w-full">
                Continue to Login Now
              </Button>
            </CardFooter>
          </>
        );

      case 'already_verified':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-blue-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-700">Already Verified</CardTitle>
              <CardDescription>
                This email address has already been verified.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                You can now log in to your account using your credentials.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={handleContinueToLogin} className="w-full">
                Go to Login
              </Button>
            </CardFooter>
          </>
        );

      case 'error':
      default:
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-700">Verification Failed</CardTitle>
              <CardDescription>
                We couldn't verify your email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthErrorBoundary 
                error={error} 
                onRetry={handleRetry}
                title="Email Verification Error"
                showHomeButton={false}
              />
              <div className="text-center text-sm text-muted-foreground mt-4">
                You can try signing up again or contact support if the problem persists.
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button onClick={handleResendVerification} variant="outline" className="flex-1">
                Sign Up Again
              </Button>
              <Button onClick={() => navigate('/login')} className="flex-1">
                Try Login
              </Button>
            </CardFooter>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto py-20 px-4">
      <Card className="max-w-md mx-auto">
        {renderContent()}
      </Card>
    </div>
  );
}
