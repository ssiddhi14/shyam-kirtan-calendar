import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Lock, Mail, ArrowLeft, AlertCircle, LogIn } from 'lucide-react';

// ✅ PERMANENT ADMIN CREDENTIALS
const ADMIN_EMAIL = 'sskskirtan@gmail.com';
const ADMIN_PASSWORD = 'sskskirtan';

// ✅ Login validation schema
const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  // ✅ LOGIN HANDLER
  const onLoginSubmit = (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    if (data.email === ADMIN_EMAIL && data.password === ADMIN_PASSWORD) {
      localStorage.setItem('isLoggedIn', 'true');

      toast({
        title: 'Welcome!',
        description: 'You have successfully logged in.',
      });

      navigate('/');
    } else {
      setError('Invalid email or password.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Back Button */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Calendar
        </Button>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-8 animate-scale-in decorative-border">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary shadow-glow">
                  <Calendar className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Admin Login
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                श्री श्याम सेवक कल्याण संघ
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sskskirtan@gmail.com"
                  {...loginForm.register('email')}
                  className="h-11"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register('password')}
                  className="h-11"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="saffron"
                size="lg"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Info */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-center text-muted-foreground">
                Only authorized administrators can access this system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
