import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Lock, Mail, ArrowLeft, AlertCircle, UserPlus, LogIn } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, isWhitelisted, checkWhitelist } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  // Redirect if already logged in and whitelisted
  useEffect(() => {
    if (user && isWhitelisted) {
      navigate('/');
    }
  }, [user, isWhitelisted, navigate]);

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    // Check whitelist first
    const whitelisted = await checkWhitelist(data.email);
    if (!whitelisted) {
      setError('This email is not authorized to access the system. Please contact the administrator.');
      setIsLoading(false);
      return;
    }

    if (isSignUp) {
      // Sign up flow
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email.toLowerCase(),
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      setIsLoading(false);

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else {
          setError(signUpError.message);
        }
      } else {
        toast({
          title: 'Account Created!',
          description: 'You can now sign in with your credentials.',
        });
        setIsSignUp(false);
      }
    } else {
      // Sign in flow
      const result = await signIn(data.email, data.password);
      setIsLoading(false);

      if (result.error) {
        if (result.error.message.includes('Invalid login')) {
          setError('Invalid email or password. If you haven\'t registered yet, please sign up first.');
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
    }
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
                {isSignUp ? 'Create Account' : 'Admin Login'}
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

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@shyamsewak.org"
                  {...register('email')}
                  className="h-11"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
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
                  {...register('password')}
                  className="h-11"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="saffron"
                size="lg"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  isSignUp ? 'Creating Account...' : 'Signing in...'
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </Button>
            </form>

            {/* Toggle Sign In/Sign Up */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "First time? Create your account"}
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="mt-1"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>

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
