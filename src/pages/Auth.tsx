import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Lock, Mail, ArrowLeft, AlertCircle, LogIn, KeyRound } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthFormData = z.infer<typeof authSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type AuthMode = 'login' | 'forgot' | 'reset';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, user, isWhitelisted, checkWhitelist, resetPassword, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Check if we're in reset mode from URL or PASSWORD_RECOVERY event
  useEffect(() => {
    if (searchParams.get('mode') === 'reset' || isPasswordRecovery) {
      setMode('reset');
    }
  }, [searchParams, isPasswordRecovery]);

  // Redirect if already logged in and whitelisted, but NOT during password recovery
  useEffect(() => {
    if (user && isWhitelisted && !isPasswordRecovery && mode !== 'reset') {
      navigate('/');
    }
  }, [user, isWhitelisted, isPasswordRecovery, mode, navigate]);

  const onLoginSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    const whitelisted = await checkWhitelist(data.email);
    if (!whitelisted) {
      setError('This email is not authorized to access the system.');
      setIsLoading(false);
      return;
    }

    const result = await signIn(data.email, data.password);
    setIsLoading(false);

    if (result.error) {
      if (result.error.message.includes('Invalid login')) {
        setError('Invalid email or password.');
      } else {
        setError(result.error.message);
      }
    } else {
      toast({
        title: 'Welcome!',
        description: 'You have successfully logged in.',
      });
      navigate('/');
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const result = await resetPassword(data.email);
    setIsLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccessMessage('Password reset email sent! Check your inbox.');
      toast({
        title: 'Email Sent',
        description: 'Check your inbox for the password reset link.',
      });
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Clear the password recovery state
      clearPasswordRecovery();
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed. Please log in with your new password.',
      });
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      setMode('login');
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
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
                  {mode === 'reset' ? (
                    <KeyRound className="h-8 w-8 text-primary-foreground" />
                  ) : (
                    <Calendar className="h-8 w-8 text-primary-foreground" />
                  )}
                </div>
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                {mode === 'login' && 'Admin Login'}
                {mode === 'forgot' && 'Forgot Password'}
                {mode === 'reset' && 'Reset Password'}
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

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                <Mail className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@shyamsewak.org"
                    {...loginForm.register('email')}
                    className="h-11"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
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
                    <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
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

                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="w-full text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot' && (
              <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="admin@shyamsewak.org"
                    {...forgotForm.register('email')}
                    className="h-11"
                  />
                  {forgotForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{forgotForm.formState.errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="saffron"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full text-sm text-primary hover:underline"
                >
                  Back to Login
                </button>
              </form>
            )}

            {/* Reset Password Form */}
            {mode === 'reset' && (
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    {...resetForm.register('password')}
                    className="h-11"
                  />
                  {resetForm.formState.errors.password && (
                    <p className="text-xs text-destructive">{resetForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    {...resetForm.register('confirmPassword')}
                    className="h-11"
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{resetForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="saffron"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Info */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-center text-muted-foreground">
                Only authorized administrators can access this system.
                Contact the organization for access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

