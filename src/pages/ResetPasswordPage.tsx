import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, updatePassword } = useAuth();
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Wait for auth to settle; Supabase may need a moment to process recovery hash from URL
  useEffect(() => {
    if (authLoading) return;
    const hasRecoveryHash = typeof window !== 'undefined' && window.location.hash.includes('type=recovery');
    if (hasRecoveryHash) {
      // Give Supabase time to process the recovery token
      const t = setTimeout(() => setAuthChecked(true), 1500);
      return () => clearTimeout(t);
    }
    setAuthChecked(true);
  }, [authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
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
    const { error: err } = await updatePassword(password);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 2000);
    }
  };

  if (!authChecked || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="max-w-sm w-full text-center space-y-4">
          <p className="text-muted-foreground">{t.resetLinkInvalid}</p>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full">
            {t.backToSignIn}
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="max-w-sm w-full p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
          <p className="text-emerald-800 font-medium">Password updated!</p>
          <p className="text-sm text-emerald-700 mt-1">Redirecting you to the home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-sm w-full space-y-6">
        <h1 className="text-xl font-semibold text-foreground">{t.setNewPassword}</h1>
        <p className="text-sm text-muted-foreground">{t.setNewPasswordSubtitle}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-medium text-foreground">{t.password}</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-lg border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-new-password" className="text-sm font-medium text-foreground">{t.confirmPassword}</Label>
            <Input
              id="confirm-new-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-11 rounded-lg border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20"
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <Button
            type="submit"
            className="w-full h-11 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.updatePassword}
          </Button>
        </form>
      </div>
    </div>
  );
}
