
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordValues) {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <p>Check your email for a link to reset your password.</p>
            </div>
          ) : (
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
                            placeholder="you@example.com"
                            type="email"
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending reset link..." : "Send reset link"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
