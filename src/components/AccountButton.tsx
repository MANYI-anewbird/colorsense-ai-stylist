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
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-border/80 shadow-xl shadow-black/5">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                {t.account}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 h-10 p-0.5 bg-neutral-100 rounded-lg">
                <TabsTrigger 
                  value="signin" 
                  className="rounded-md text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                >
                  {t.signIn}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-md text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                >
                  {t.signUp}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground mb-4">{t.welcomeBack}</p>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-foreground">{t.email}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-lg border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-foreground">{t.password}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 rounded-lg border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 transition-colors"
                    />
                  </div>
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-11 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.signIn}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground mb-4">{t.createAccountSubtitle}</p>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">{t.email}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-lg border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">{t.password}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 rounded-lg border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-sm font-medium text-foreground">{t.confirmPassword}</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 rounded-lg border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 transition-colors"
                    />
                  </div>
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-11 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.signUp}
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
