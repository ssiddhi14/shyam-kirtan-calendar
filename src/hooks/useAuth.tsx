import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isWhitelisted: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkWhitelist: (email: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        
        // Handle PASSWORD_RECOVERY event
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer whitelist check
        if (session?.user?.email) {
          setTimeout(() => {
            checkWhitelist(session.user.email!).then(setIsWhitelisted);
          }, 0);
        } else {
          setIsWhitelisted(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        checkWhitelist(session.user.email).then(setIsWhitelisted);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false);
  };

  const checkWhitelist = async (email: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('whitelisted_users')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    return !error && !!data;
  };

  const signIn = async (email: string, password: string) => {
    // First check if email is whitelisted
    const whitelisted = await checkWhitelist(email);
    
    if (!whitelisted) {
      return { error: new Error('This email is not authorized to access the system. Please contact the administrator.') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsWhitelisted(false);
  };

  const resetPassword = async (email: string) => {
    // Check if email is whitelisted first
    const whitelisted = await checkWhitelist(email);
    
    if (!whitelisted) {
      return { error: new Error('This email is not authorized to access the system.') };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });

    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isWhitelisted, isPasswordRecovery, signIn, signOut, checkWhitelist, resetPassword, clearPasswordRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
