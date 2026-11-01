import React from 'react';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '@/i18n';
import {
  Search,
  Bell,
  Globe,
  Radio,
  User,
  ShieldAlert,
} from 'lucide-react';

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    setAppLanguage(nextLang);
  };

  return (
    <header className="h-16 bg-cyber-deep/80 backdrop-blur-md border-b border-cyber-border/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-cyber-textDark absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            className="w-full bg-cyber-card/80 border border-cyber-border/80 rounded-xl ps-10 pe-4 py-2 text-sm text-cyber-textMain placeholder:text-cyber-textDark focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/30 transition-all font-sans"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* SignalR Connection Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs text-emerald-400 font-medium">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>{t('common.connected')}</span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyber-border/80 bg-cyber-card/80 hover:bg-cyber-card text-cyber-textMuted hover:text-cyber-textMain text-xs font-semibold transition-all duration-200"
          title="تغيير اللغة / Switch Language"
        >
          <Globe className="w-4 h-4 text-cyber-cyan" />
          <span>{currentLang === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl border border-cyber-border/80 bg-cyber-card/80 hover:bg-cyber-card text-cyber-textMuted hover:text-cyber-textMain transition-all duration-200"
          title={t('common.notifications')}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-cyber-cyan" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 ps-3 border-s border-cyber-border/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-black shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block text-start">
            <p className="text-xs font-semibold text-cyber-textMain flex items-center gap-1">
              <span>ضياء المهندس</span>
              <ShieldAlert className="w-3.5 h-3.5 text-cyber-gold" />
            </p>
            <p className="text-[10px] text-cyber-cyan font-mono">{t('common.superAdmin')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

