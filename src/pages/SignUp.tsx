
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';

const signUpSchema = z.object({
  firstName: z.string().trim().min(2, { message: 'First name must be at least 2 characters' }).max(50),
  lastName: z.string().trim().min(2, { message: 'Last name must be at least 2 characters' }).max(50),
  email: z.string().trim().email({ message: 'Please enter a valid email address' }).max(255),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[a-z]/, { message: 'Must contain a lowercase letter' })
    .regex(/[A-Z]/, { message: 'Must contain an uppercase letter' })
    .regex(/\d/, { message: 'Must contain a number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Must contain a special character' }),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms of service' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const location = useLocation();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUpComplete, setIsSignUpComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: undefined as unknown as true,
    },
  });

  const watchedPassword = form.watch('password');

  const onSubmit = async (data: SignUpValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await signup(data.firstName, data.lastName, data.email, data.password);
      setUserEmail(data.email);
      setIsSignUpComplete(true);
      toast.success('Account created successfully! Please check your email to verify your account.');
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'An error occurred during sign up. Please try again.';
      if (errorMessage.includes('User already registered')) {
        setError('An account with this email already exists. Please try logging in instead.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSignUpComplete) {
    return (
      <div className="container max-w-md mx-auto py-10 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              We've sent a verification email to:
            </p>
            <p className="font-medium text-primary">{userEmail}</p>
            <p className="text-sm text-muted-foreground">
              Please check your email and click the verification link to activate your account.
            </p>
            <Alert>
              <AlertDescription>
                <strong>Note:</strong> The verification link will expire in 24 hours. If you don't see the email, please check your spam folder.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={() => setIsSignUpComplete(false)}
              variant="outline"
              className="w-full"
            >
              Sign up with different email
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already verified?{" "}
              <Link
                to="/login"
                state={{ from: location.state?.from }}
                className="text-primary font-medium hover:underline"
              >
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4" aria-live="assertive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="First name"
                            aria-label="First Name"
                            className="pl-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last name"
                          aria-label="Last Name"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          aria-label="Email"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
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
                          placeholder="Create a password"
                          aria-label="Password"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
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
                    <FormMessage />
                    <PasswordStrengthIndicator password={watchedPassword} />
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
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          aria-label="Confirm Password"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I agree to the{' '}
                        <Link to="/terms" className="text-primary underline hover:no-underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary underline hover:no-underline">
                          Privacy Policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="text-primary font-medium hover:underline"
            >
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
