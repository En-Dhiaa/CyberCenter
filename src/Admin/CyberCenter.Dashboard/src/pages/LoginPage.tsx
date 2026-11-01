import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('Admin@Cyber2026!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (username === 'superadmin' && password === 'Admin@Cyber2026!') {
        localStorage.setItem('cybercenter_auth_token', 'mock-jwt-token-superadmin');
        localStorage.setItem('cybercenter_user', JSON.stringify({
          username: 'superadmin',
          fullName: 'ضياء المهندس',
          role: 'SuperAdmin'
        }));
        navigate('/');
      } else {
        setError(isRtl ? 'اسم المستخدم أو كلمة المرور غير صحيحة.' : 'Invalid username or password.');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickDemo = () => {
    setUsername('superadmin');
    setPassword('Admin@Cyber2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Glow Blobs */}
      <div className="absolute -top-40 -start-40 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -end-40 w-96 h-96 bg-cyber-emerald/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-cyber-card/90 backdrop-blur-xl border border-cyber-border rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-400 flex items-center justify-center shadow-glow-cyan">
            <ShieldCheck className="w-10 h-10 text-black stroke-[2.5]" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
            <span className="text-cyber-textMain tracking-wide">CYBER</span>
            <span className="text-cyber-cyan font-extrabold">CENTER</span>
          </div>
          <p className="text-xs text-cyber-textMuted mt-1 font-mono">
            {t('common.appTagline')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cyber-textMuted mb-2">
              اسم المستخدم (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-cyber-textDark absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم..."
                className="w-full bg-cyber-deep border border-cyber-border rounded-xl ps-10 pe-4 py-3 text-sm text-cyber-textMain placeholder:text-cyber-textDark focus:outline-none focus:border-cyber-cyan/60 font-sans transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyber-textMuted mb-2">
              كلمة المرور (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyber-textDark absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-cyber-deep border border-cyber-border rounded-xl ps-10 pe-4 py-3 text-sm text-cyber-textMain placeholder:text-cyber-textDark focus:outline-none focus:border-cyber-cyan/60 font-sans transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-cyber-textDark pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-cyber-border text-cyber-cyan bg-cyber-deep focus:ring-0" />
              <span>تذكر هذه المحطة</span>
            </label>
            <span className="text-cyber-cyan/80 hover:underline cursor-pointer">نسيت كلمة المرور؟</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold text-sm shadow-glow-cyan flex items-center justify-center gap-2 transition-all duration-200"
          >
            {isLoading ? (
              <span>جاري التحقق...</span>
            ) : (
              <>
                <span>تسجيل الدخول للمنظومة</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Autofill Pill */}
        <div className="mt-6 pt-6 border-t border-cyber-border/60 text-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-deep border border-cyber-border hover:border-cyber-cyan/40 text-[11px] font-mono text-cyber-cyan transition-all"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>بيانات الاختبار: superadmin / Admin@Cyber2026!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
