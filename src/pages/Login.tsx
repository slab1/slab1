
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { errorTracker } from '@/utils/error-tracking';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, session, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Show success message from email verification
  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      toast.success(message);
      // Clear the state to prevent showing the message again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Navigate when session is established (don't wait for user data)
  useEffect(() => {
    console.log('Login: Auth state check:', { hasSession: !!session, isLoading, authLoading });
    if (session && !isLoading && !authLoading) {
      console.log('Login: Session established, navigating');
      const from = location.state?.from || '/profile';
      navigate(from, { replace: true });
    }
  }, [session, isLoading, authLoading, navigate, location.state]);

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Login: Attempting login for', data.email);
      await login(data.email, data.password);
      console.log('Login: Login action completed');
      toast.success('Logged in successfully!');
      // Navigation will happen via the useEffect above when session is ready
    } catch (err) {
      console.error('Login: Login error', err);
      errorTracker.captureError(err as Error, 'error', {
        context: 'user_login',
        email: data.email
      });
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Log in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                          aria-invalid={!!form.formState.errors.email}
                          aria-describedby="email-error"
                        />
                      </div>
                    </FormControl>
                    <FormMessage id="email-error" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                          aria-invalid={!!form.formState.errors.password}
                          aria-describedby="password-error"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? 
                            <EyeOff className="h-5 w-5 text-muted-foreground" /> : 
                            <Eye className="h-5 w-5 text-muted-foreground" />
                          }
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage id="password-error" />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <div></div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              state={{ from: location.state?.from }}
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
