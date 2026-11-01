import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Building,
  DollarSign,
  Save,
  CheckCircle2,
  WifiOff,
} from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const [centerName, setCenterName] = useState('CyberCenter Gaming Lounge');
  const [centerPhone, setCenterPhone] = useState('+967 770 000 000');
  const [currency, setCurrency] = useState('YER');
  const [defaultHourlyRate, setDefaultHourlyRate] = useState(500);
  const [vipHourlyRate, setVipHourlyRate] = useState(800);
  const [offlineGracePeriod, setOfflineGracePeriod] = useState(5);
  const [warningMinutes, setWarningMinutes] = useState(10);
  const [allowGuestBrowsing, setAllowGuestBrowsing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-cyber-textMain flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-cyan">
              <Settings className="w-5 h-5" />
            </div>
            <span>{t('nav.systemSettings')}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
              SUPER ADMIN ONLY
            </span>
          </h1>
          <p className="text-xs text-cyber-textMuted mt-1">
            إعدادات هوية المركز، تسعيرة الساعات، سياسات انقطاع الاتصال (Offline Grace Period)، وضوابط الأمان
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم حفظ الإعدادات وتوثيقها في سجل التدقيق بنجاح</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: General Details */}
        <div className="bg-cyber-card/80 border border-cyber-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cyber-border/60">
            <Building className="w-4 h-4 text-cyber-cyan" />
            <h3 className="font-bold text-sm text-cyber-textMain">بيانات المركز والهوية</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-cyber-textMuted mb-1 font-semibold">اسم الصالة / المركز</label>
              <input
                type="text"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
              />
            </div>
            <div>
              <label className="block text-cyber-textMuted mb-1 font-semibold">رقم هاتف الإدارة</label>
              <input
                type="text"
                value={centerPhone}
                onChange={(e) => setCenterPhone(e.target.value)}
                className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
              />
            </div>
            <div>
              <label className="block text-cyber-textMuted mb-1 font-semibold">رمز العملة النقدية</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
              >
                <option value="YER">ريال يمني (YER)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Rates */}
        <div className="bg-cyber-card/80 border border-cyber-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cyber-border/60">
            <DollarSign className="w-4 h-4 text-cyber-gold" />
            <h3 className="font-bold text-sm text-cyber-textMain">تسعيرة الساعات والجلسات</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-cyber-textMuted mb-1 font-semibold">سعر الساعة الافتراضي (الصالة العامة)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={defaultHourlyRate}
                  onChange={(e) => setDefaultHourlyRate(Number(e.target.value))}
                  className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-cyan font-mono font-bold focus:outline-none focus:border-cyber-cyan"
                />
                <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-cyber-textDark">{currency}</span>
              </div>
            </div>

            <div>
              <label className="block text-cyber-textMuted mb-1 font-semibold">سعر ساعة صالة المحترفين (VIP Lounge)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={vipHourlyRate}
                  onChange={(e) => setVipHourlyRate(Number(e.target.value))}
                  className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-gold font-mono font-bold focus:outline-none focus:border-cyber-gold"
                />
                <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-cyber-textDark">{currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Session Leases & Offline Policies */}
        <div className="bg-cyber-card/80 border border-cyber-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cyber-border/60">
            <WifiOff className="w-4 h-4 text-cyber-crimson" />
            <h3 className="font-bold text-sm text-cyber-textMain">سياسات انقطاع الاتصال والأمان الزمني (Offline Resilience)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-cyber-textMuted mb-1 font-semibold">
                مهلة السماح عند انقطاع الشبكة (Offline Grace Period)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={offlineGracePeriod}
                  onChange={(e) => setOfflineGracePeriod(Number(e.target.value))}
                  className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain font-mono font-bold focus:outline-none focus:border-cyber-cyan"
                />
                <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-cyber-textDark">دقائق</span>
              </div>
              <p className="text-[11px] text-cyber-textDark mt-1">
                المدة التي يسمح فيها للمحطة بمواصلة اللعب بعد انقطاع الاتصال بالخادم قبل القفل التلقائي.
              </p>
            </div>

            <div>
              <label className="block text-cyber-textMuted mb-1 font-semibold">
                إشعار التنبيه قبل انتهاء الجلسة
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={warningMinutes}
                  onChange={(e) => setWarningMinutes(Number(e.target.value))}
                  className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain font-mono font-bold focus:outline-none focus:border-cyber-cyan"
                />
                <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-cyber-textDark">دقائق</span>
              </div>
              <p className="text-[11px] text-cyber-textDark mt-1">
                ظهور تنبيه مرئي وصوتي في شريط الـ HUD قبل نفاد رصيد الوقت.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={allowGuestBrowsing}
                onChange={(e) => setAllowGuestBrowsing(e.target.checked)}
                className="w-4 h-4 rounded border-cyber-border text-cyber-cyan bg-cyber-deep focus:ring-0"
              />
              <span className="text-cyber-textMain font-medium">
                السماح بتصفح الإنترنت العادي للزوار المؤقتين (عبر متصفح مخصص)
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold text-xs shadow-glow-cyan transition-all"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات واعتمادها</span>
          </button>
        </div>
      </form>
    </div>
  );
};
