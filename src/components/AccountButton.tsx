import React, { useState } from 'react';
import { User, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AccountButtonProps {
  variant?: 'light' | 'dark';
}

export function AccountButton({ variant = 'dark' }: AccountButtonProps) {
  const { user, isLoading, signUp, signIn, signOut, loginDialogOpen, setLoginDialogOpen } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const buttonStyles = variant === 'dark'
    ? 'bg-white/10 border-white/20 text-white/90 hover:bg-white/15'
    : 'bg-white/80 border-neutral-200 text-neutral-700 hover:bg-white';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setLoginDialogOpen(open);
    if (!open) resetForm();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email, password);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setLoginDialogOpen(false);
      resetForm();
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setLoginDialogOpen(false);
      resetForm();
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur-sm ${buttonStyles}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (user) {
    const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? t.account;
    const initials = displayName
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center justify-center rounded-full overflow-hidden border backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 ${buttonStyles}`}
            aria-label={t.account}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName} />
              <AvatarFallback className="text-xs bg-white/20 text-white">
                {initials || <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{displayName}</span>
              {user.email && (
                <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            {t.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <button
        onClick={() => setLoginDialogOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm border transition-colors ${buttonStyles}`}
        aria-label={t.login}
      >
        <User className="w-4 h-4" />
        <span className="text-xs font-medium">{t.login}</span>
      </button>

      <Dialog open={loginDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
          {/* Editorial Color Stripe */}
          <div className="color-stripe h-1.5" />
          
          <div className="p-6 pt-5">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold tracking-tight text-center">
                {t.account}
              </DialogTitle>
              <p className="text-sm text-muted-foreground text-center mt-1">
                {t.signIn === 'Sign In' ? 'Welcome back! Please sign in to continue.' : '欢迎回来！请登录以继续。'}
              </p>
            </DialogHeader>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger 
                  value="signin" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium transition-all"
                >
                  {t.signIn}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium transition-all"
                >
                  {t.signUp}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">{t.email}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl border-2 border-muted focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">{t.password}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl border-2 border-muted focus:border-primary transition-colors"
                    />
                  </div>
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-editorial-magenta to-editorial-coral hover:opacity-90 transition-opacity" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.signIn}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">{t.email}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl border-2 border-muted focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">{t.password}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl border-2 border-muted focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-sm font-medium">{t.confirmPassword}</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl border-2 border-muted focus:border-primary transition-colors"
                    />
                  </div>
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-editorial-magenta to-editorial-coral hover:opacity-90 transition-opacity" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.signUp}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
