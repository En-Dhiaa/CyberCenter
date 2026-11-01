import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarCheck2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  X,
} from 'lucide-react';

interface ClosingItem {
  id: string;
  year: number;
  month: number;
  grossRevenue: number;
  expenses: number;
  netProfit: number;
  status: 'ApprovedAndLocked' | 'Draft';
  approvedBy: string;
  approvedAt: string;
  notes?: string;
}

const initialClosings: ClosingItem[] = [
  {
    id: 'c-1',
    year: 2026,
    month: 10,
    grossRevenue: 720000,
    expenses: 195000,
    netProfit: 525000,
    status: 'ApprovedAndLocked',
    approvedBy: 'ضياء المهندس (Super Admin)',
    approvedAt: '2026-10-31 23:59',
    notes: 'تمت مطابقة الصندوق النقدي مع حسابات الكريمي وجوالي بالكامل.',
  },
  {
    id: 'c-2',
    year: 2026,
    month: 9,
    grossRevenue: 610000,
    expenses: 175000,
    netProfit: 435000,
    status: 'ApprovedAndLocked',
    approvedBy: 'ضياء المهندس (Super Admin)',
    approvedAt: '2026-09-30 23:50',
    notes: 'إقفال شهر سبتمبر - تم اعتماد عمولات المشرفين والرواتب.',
  },
  {
    id: 'c-3',
    year: 2026,
    month: 8,
    grossRevenue: 640000,
    expenses: 190000,
    netProfit: 450000,
    status: 'ApprovedAndLocked',
    approvedBy: 'ضياء المهندس (Super Admin)',
    approvedAt: '2026-08-31 23:45',
  },
];

export const MonthlyClosingPage: React.FC = () => {
  const { t } = useTranslation();
  const [closings, setClosings] = useState<ClosingItem[]>(initialClosings);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockMonth, setLockMonth] = useState(11);
  const [lockYear] = useState(2026);
  const [lockNotes, setLockNotes] = useState('');

  const cumulativeProfit = closings.reduce((acc, c) => acc + c.netProfit, 0);

  const handleLockMonth = (e: React.FormEvent) => {
    e.preventDefault();

    if (closings.some((c) => c.year === lockYear && c.month === lockMonth)) {
      alert(t('تم إقفال واعتماد هذا الشهر مسبقاً!'));
      return;
    }

    const newClosing: ClosingItem = {
      id: `c-${Date.now()}`,
      year: lockYear,
      month: lockMonth,
      grossRevenue: 680000,
      expenses: 180000,
      netProfit: 500000,
      status: 'ApprovedAndLocked',
      approvedBy: 'ضياء المهندس (Super Admin)',
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: lockNotes.trim() || undefined,
    };

    setClosings([newClosing, ...closings]);
    setShowLockModal(false);
    setLockNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <CalendarCheck2 className="w-7 h-7 text-emerald-400" />
            {t('الإقفال الشهري والاعتماد المالي (Monthly Closing)')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('تثبيت واعتماد النتائج المالية الشهرية وختمها برمجياً ضد أي تعديل من قبل الإدارة العامة')}
          </p>
        </div>

        <button
          onClick={() => setShowLockModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20"
        >
          <Lock className="w-5 h-5" />
          <span>{t('اعتماد وإقفال شهر جديد')}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('الأشهر المقفلة والمعتمدة')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{closings.length}</span>
            <span className="text-xs text-slate-500">{t('شهر مقفل برمجياً')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('صافي الأرباح المعتمدة التراكمية')}</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400">{cumulativeProfit.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('حالة الأمان والحماية')}</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {t('سجلات غير قابلة للتعديل (Immutable)')}
            </span>
          </div>
        </div>
      </div>

      {/* Closings Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('الفترة المحاسبية')}</th>
                <th className="px-4 py-3 font-semibold">{t('إجمالي الإيرادات')}</th>
                <th className="px-4 py-3 font-semibold">{t('المصروفات')}</th>
                <th className="px-4 py-3 font-semibold">{t('صافي الربح المعتمد')}</th>
                <th className="px-4 py-3 font-semibold">{t('المعتمد والتاريخ')}</th>
                <th className="px-4 py-3 font-semibold text-center">{t('حالة الإقفال')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {closings.map((closing) => (
                <tr key={closing.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-cyan-400 text-sm">
                        {closing.year} / {closing.month < 10 ? `0${closing.month}` : closing.month}
                      </span>
                    </div>
                    {closing.notes && (
                      <div className="text-[11px] text-slate-400 mt-1">{closing.notes}</div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-slate-200">
                    {closing.grossRevenue.toLocaleString()} ر.ي
                  </td>

                  <td className="px-4 py-3.5 font-mono text-rose-400">
                    -{closing.expenses.toLocaleString()} ر.ي
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 text-base">
                    +{closing.netProfit.toLocaleString()} ر.ي
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-300">
                    <div>{closing.approvedBy}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{closing.approvedAt}</div>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <Lock className="w-3 h-3" />
                      <span>{t('معتمد ومقفل')}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lock Month Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>{t('اعتماد وتثبيت الإقفال الشهري')}</span>
              </h3>
              <button
                onClick={() => setShowLockModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{t('تنبيه أمان صارم:')} </span>
                {t('بمجرد اعتماد وإقفال الشهر، لن يتمكن أي مستخدم أو كاشير من تعديل أو حذف أي حركة مالية سابقة لهذا الشهر نهائياً.')}
              </div>
            </div>

            <form onSubmit={handleLockMonth} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('السنة')}
                  </label>
                  <input
                    type="number"
                    disabled
                    value={lockYear}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('الشهر المراد إقفاله')}
                  </label>
                  <select
                    value={lockMonth}
                    onChange={(e) => setLockMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        شهر {m < 10 ? `0${m}` : m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('ملاحظات الاعتماد والختم')}
                </label>
                <textarea
                  rows={2}
                  value={lockNotes}
                  onChange={(e) => setLockNotes(e.target.value)}
                  placeholder="تمت مطابقة الكاش الفعلي مع القيود..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  {t('إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t('تأكيد الإقفال والختم')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
