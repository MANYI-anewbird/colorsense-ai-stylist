import React from 'react';
import { Outlet } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AccountButton } from '@/components/AccountButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t.login}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <div className="bg-foreground safe-area-top">
          <div className="flex items-center justify-end px-4 py-3">
            <div className="flex items-center gap-2">
              <AccountButton variant="dark" />
              <LanguageSwitcher variant="dark" />
            </div>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-editorial-magenta via-editorial-yellow to-editorial-cyan opacity-60" />
        </div>

        {/* Locked content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground text-center mb-2">
            {t.loginRequired}
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {t.loginToUnlock}
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
