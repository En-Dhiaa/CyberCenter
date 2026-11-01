import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const monthlyTrendsData = [
  { month: 'مايو', revenue: 420000, expenses: 140000, profit: 280000 },
  { month: 'يونيو', revenue: 490000, expenses: 160000, profit: 330000 },
  { month: 'يوليو', revenue: 580000, expenses: 185000, profit: 395000 },
  { month: 'أغسطس', revenue: 640000, expenses: 190000, profit: 450000 },
  { month: 'سبتمبر', revenue: 610000, expenses: 175000, profit: 435000 },
  { month: 'أكتوبر', revenue: 720000, expenses: 195000, profit: 525000 },
];

const channelBreakdownData = [
  { name: 'جلسات الألعاب والكروت', amount: 485000, fill: '#06B6D4' },
  { name: 'مبيعات الكافيه والمتجر', amount: 155000, fill: '#F59E0B' },
  { name: 'شحن العضويات والمحافظ', amount: 80000, fill: '#10B981' },
];

export const FinancialReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const grossRevenue = 720000;
  const totalExpenses = 195000;
  const netProfit = grossRevenue - totalExpenses;
  const netMargin = ((netProfit / grossRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            {t('التقارير المالية والأرباح (Financial Reports)')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('تحليلات تفصيلية للإيرادات، المصروفات، صافي الأرباح، وقائمة الدخل التراكمية (P&L)')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedPeriod === 'month' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'
              }`}
            >
              {t('هذا الشهر')}
            </button>
            <button
              onClick={() => setSelectedPeriod('quarter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedPeriod === 'quarter' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'
              }`}
            >
              {t('الربع الأخير')}
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedPeriod === 'year' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'
              }`}
            >
              {t('السنة الحالية')}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('إجمالي الإيرادات')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{grossRevenue.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">+18% {t('مقارنة بالشهر الماضي')}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('إجمالي المصروفات')}</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">{totalExpenses.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">27.1% {t('من إجمالي الإيرادات')}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('صافي الأرباح التشغيلية')}</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400">{netProfit.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
          <div className="mt-1 text-[11px] text-cyan-400 font-medium">{t('هامش ربح قياسي')}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('هامش الربح الصافي')}</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{netMargin}%</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">ممتاز (Healthy Margin)</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 6-Month Trends Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-base">{t('اتجاه الإيرادات وصافي الأرباح التراكمية')}</h3>
              <p className="text-xs text-slate-400">{t('تطور الأداء المالي لآخر 6 أشهر')}</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendsData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0E17', borderColor: '#334155', borderRadius: 8 }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} ر.ي`, '']}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#06B6D4" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name="صافي الأرباح" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Revenue by Channel Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-slate-100 text-base">{t('مصادر الإيرادات')}</h3>
            <p className="text-xs text-slate-400">{t('توزيع الدخل حسب خطوط الخدمة')}</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelBreakdownData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0E17', borderColor: '#334155', borderRadius: 8 }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ر.ي`, 'القيمة']}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* P&L Statement Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
          <span>{t('قائمة الدخل والأرباح (P&L Income Statement)')}</span>
        </h3>

        <div className="divide-y divide-slate-800/80 text-sm">
          <div className="py-2.5 flex items-center justify-between font-bold text-slate-200">
            <span>+ {t('إجمالي إيرادات جلسات الألعاب')}</span>
            <span className="font-mono text-cyan-400">485,000 ر.ي</span>
          </div>
          <div className="py-2.5 flex items-center justify-between font-bold text-slate-200">
            <span>+ {t('إجمالي مبيعات المتجر والكافيه')}</span>
            <span className="font-mono text-amber-400">155,000 ر.ي</span>
          </div>
          <div className="py-2.5 flex items-center justify-between font-bold text-slate-200">
            <span>+ {t('إيداعات وتجديدات العضويات الدائمة')}</span>
            <span className="font-mono text-emerald-400">80,000 ر.ي</span>
          </div>
          <div className="py-3 flex items-center justify-between font-black text-slate-100 bg-slate-950/40 px-3 rounded-lg">
            <span>= {t('مجموع الإيرادات التشغيلية الكلية (Gross Revenue)')}</span>
            <span className="font-mono text-base text-cyan-400">720,000 ر.ي</span>
          </div>
          <div className="py-2.5 flex items-center justify-between text-rose-400">
            <span>- {t('المصروفات التشغيلية (إنترنت، كهرباء، نظافة، مستلزمات)')}</span>
            <span className="font-mono font-bold">-195,000 ر.ي</span>
          </div>
          <div className="py-3 flex items-center justify-between font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 rounded-lg text-base">
            <span>✔ {t('صافي الربح الفعلي بعد المصروفات (Net Income)')}</span>
            <span className="font-mono text-lg">525,000 ر.ي ({netMargin}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
