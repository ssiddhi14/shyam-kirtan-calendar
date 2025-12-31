import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, isWhitelisted, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary shadow-soft">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-serif font-bold text-foreground leading-tight">
              श्री श्याम सेवक
            </h1>
            <p className="text-xs text-muted-foreground -mt-0.5">कल्याण संघ</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && isWhitelisted ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-block text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="saffron"
              size="sm"
              onClick={() => navigate('/auth')}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
