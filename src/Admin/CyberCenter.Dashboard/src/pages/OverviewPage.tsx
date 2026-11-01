import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Monitor,
  Gamepad2,
  DollarSign,
  ShoppingBag,
  Activity,
  AlertTriangle,
  Play,
  CreditCard,
  PlusCircle,
  Lock,
  Unlock,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge, DeviceStatus } from '@/components/ui/StatusBadge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StationItem {
  id: string;
  number: number;
  name: string;
  status: DeviceStatus;
  user?: string;
  remainingMinutes?: number;
  ip: string;
  downMbps: number;
  upMbps: number;
}

const mockStations: StationItem[] = [
  { id: '1', number: 1, name: 'VIP-Station-01', status: 'Occupied', user: 'عمر القحطاني', remainingMinutes: 84, ip: '192.168.1.101', downMbps: 12.4, upMbps: 2.1 },
  { id: '2', number: 2, name: 'VIP-Station-02', status: 'Occupied', user: 'أحمد السامعي', remainingMinutes: 35, ip: '192.168.1.102', downMbps: 24.8, upMbps: 4.5 },
  { id: '3', number: 3, name: 'Pro-Station-03', status: 'Available', ip: '192.168.1.103', downMbps: 0.1, upMbps: 0.0 },
  { id: '4', number: 4, name: 'Pro-Station-04', status: 'Occupied', user: 'كرت مؤقت #8921', remainingMinutes: 12, ip: '192.168.1.104', downMbps: 45.2, upMbps: 8.7 },
  { id: '5', number: 5, name: 'Pro-Station-05', status: 'Reserved', ip: '192.168.1.105', downMbps: 0.0, upMbps: 0.0 },
  { id: '6', number: 6, name: 'Main-Station-06', status: 'Locked', ip: '192.168.1.106', downMbps: 0.0, upMbps: 0.0 },
  { id: '7', number: 7, name: 'Main-Station-07', status: 'Available', ip: '192.168.1.107', downMbps: 0.2, upMbps: 0.0 },
  { id: '8', number: 8, name: 'Main-Station-08', status: 'Offline', ip: '192.168.1.108', downMbps: 0.0, upMbps: 0.0 },
];

const revenueChartData = [
  { time: '10:00', revenue: 15000 },
  { time: '12:00', revenue: 32000 },
  { time: '14:00', revenue: 48000 },
  { time: '16:00', revenue: 85000 },
  { time: '18:00', revenue: 142000 },
  { time: '20:00', revenue: 210000 },
  { time: '22:00', revenue: 285000 },
];

export const OverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const [stations, setStations] = useState<StationItem[]>(mockStations);
  const [filter, setFilter] = useState<'All' | 'Available' | 'Occupied' | 'Offline'>('All');

  const filteredStations = stations.filter((st) => {
    if (filter === 'All') return true;
    return st.status === filter;
  });

  const toggleStationLock = (id: string) => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newStatus: DeviceStatus = s.status === 'Locked' ? 'Available' : 'Locked';
        return { ...s, status: newStatus };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-cyber-deep to-cyber-card p-6 rounded-2xl border border-cyber-border">
        <div>
          <h1 className="text-2xl font-bold text-cyber-textMain flex items-center gap-2">
            <span>لوحة التحكم والمراقبة المركزية</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-mono">
              LIVE SYSTEM
            </span>
          </h1>
          <p className="text-sm text-cyber-textMuted mt-1">
            إدارة أجهزة المركز، الجلسات، المبيعات اللحظية، وتدفق حركة البيانات
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-semibold text-xs rounded-xl shadow-glow-cyan transition-all">
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>{t('dashboard.quickActions.openSession')}</span>
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 bg-cyber-card border border-cyber-border hover:border-cyber-borderLight text-cyber-textMain font-medium text-xs rounded-xl transition-all">
            <CreditCard className="w-3.5 h-3.5 text-cyber-gold" />
            <span>{t('dashboard.quickActions.generateCards')}</span>
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 bg-cyber-card border border-cyber-border hover:border-cyber-borderLight text-cyber-textMain font-medium text-xs rounded-xl transition-all">
            <PlusCircle className="w-3.5 h-3.5 text-cyber-emerald" />
            <span>{t('dashboard.quickActions.addExpense')}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title={t('dashboard.stats.totalDevices')}
          value="48"
          subtitle="40 أونلاين / 8 أوفلاين"
          icon={Monitor}
          accentColor="cyan"
        />
        <StatCard
          title={t('dashboard.stats.activeSessions')}
          value="34"
          subtitle="نسبة الإشغال 71%"
          icon={Gamepad2}
          accentColor="emerald"
          trend={{ value: '14%', isPositive: true }}
        />
        <StatCard
          title={t('dashboard.stats.todayRevenue')}
          value="285,400"
          subtitle="ريال يمني"
          icon={DollarSign}
          accentColor="amber"
          trend={{ value: '22%', isPositive: true }}
        />
        <StatCard
          title={t('dashboard.stats.storeSales')}
          value="64,200"
          subtitle="28 طلب مكتمل"
          icon={ShoppingBag}
          accentColor="violet"
        />
        <StatCard
          title={t('dashboard.stats.networkThroughput')}
          value="184 Mbps"
          subtitle="↓ 145 / ↑ 39 Mbps"
          icon={Activity}
          accentColor="cyan"
        />
        <StatCard
          title={t('dashboard.stats.systemAlerts')}
          value="0"
          subtitle="كل الأنظمة مستقرة"
          icon={AlertTriangle}
          accentColor="emerald"
        />
      </div>

      {/* Mid Section: Live Revenue Chart & Fleet Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Flow Chart */}
        <div className="lg:col-span-2 bg-cyber-card/80 backdrop-blur-sm border border-cyber-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-cyber-textMain text-sm">تدفق الإيرادات اليومية</h3>
              <p className="text-xs text-cyber-textDark">معدل الإيراد التراكمي على مدار ساعات العمل</p>
            </div>
            <span className="text-xs font-mono text-cyber-gold bg-cyber-gold/10 px-2 py-1 rounded border border-cyber-gold/20">
              إجمالي اليوم: 285,400 ر.ي
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141C2E',
                    borderColor: '#253350',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Quick Status Summary */}
        <div className="bg-cyber-card/80 backdrop-blur-sm border border-cyber-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-cyber-textMain text-sm mb-1">ملخص أسطول المحطات</h3>
            <p className="text-xs text-cyber-textDark mb-4">توزيع حالات الأجهزة الحية حالياً</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-cyber-deep/60 border border-cyber-border/40">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-cyber-textMuted">المحطات المتاحة</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">14 محطة</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-cyber-deep/60 border border-cyber-border/40">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-cyber-textMuted">المحطات المشغولة</span>
                </span>
                <span className="font-mono font-bold text-cyan-400">26 محطة</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-cyber-deep/60 border border-cyber-border/40">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-cyber-textMuted">المحطات المحجوزة</span>
                </span>
                <span className="font-mono font-bold text-purple-400">4 محطات</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-cyber-deep/60 border border-cyber-border/40">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-cyber-textMuted">أجهزة غير متصلة</span>
                </span>
                <span className="font-mono font-bold text-slate-400">4 محطات</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-cyber-border/40 text-center">
            <span className="text-xs text-cyber-cyan hover:underline cursor-pointer font-medium">
              الانتقال للخريطة التفاعلية الكاملة ←
            </span>
          </div>
        </div>
      </div>

      {/* Station Cards Grid Section */}
      <div className="bg-cyber-card/60 border border-cyber-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-cyber-textMain text-base">المحطات الحية (Live Station Grid)</h3>
            <p className="text-xs text-cyber-textMuted mt-0.5">تحكم فوري مباشر بكل جهاز من الأجهزة المتصلة</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 bg-cyber-deep p-1 rounded-xl border border-cyber-border text-xs">
            {(['All', 'Available', 'Occupied', 'Offline'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === st
                    ? 'bg-cyber-cyan text-black font-semibold shadow-sm'
                    : 'text-cyber-textMuted hover:text-cyber-textMain'
                }`}
              >
                {t(`dashboard.liveFleet.filter${st}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Stations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStations.map((station) => (
            <div
              key={station.id}
              className="bg-cyber-deep/80 border border-cyber-border hover:border-cyber-cyan/40 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/60 flex flex-col justify-between"
            >
              {/* Header: Station Number + Status */}
              <div className="flex items-center justify-between pb-3 border-b border-cyber-border/50">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-cyber-card border border-cyber-border flex items-center justify-center font-mono font-bold text-xs text-cyber-cyan">
                    #{station.number}
                  </span>
                  <span className="font-semibold text-sm text-cyber-textMain">{station.name}</span>
                </div>
                <StatusBadge status={station.status} size="sm" />
              </div>

              {/* Body: User & Remaining Time */}
              <div className="py-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyber-textDark">{t('devices.currentUser')}:</span>
                  <span className="font-medium text-cyber-textMain">{station.user || '—'}</span>
                </div>

                {station.remainingMinutes !== undefined && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyber-textDark flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyber-cyan" />
                      {t('devices.remainingTime')}:
                    </span>
                    <span className="font-mono font-bold text-cyber-cyan">
                      {station.remainingMinutes} {t('common.minutes')}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-cyber-textDark font-mono pt-1">
                  <span className="flex items-center gap-0.5 text-emerald-400">
                    <ArrowDownLeft className="w-3 h-3" /> {station.downMbps} Mbps
                  </span>
                  <span className="flex items-center gap-0.5 text-cyan-400">
                    <ArrowUpRight className="w-3 h-3" /> {station.upMbps} Mbps
                  </span>
                </div>
              </div>

              {/* Footer Quick Controls */}
              <div className="pt-3 border-t border-cyber-border/50 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleStationLock(station.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    station.status === 'Locked'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  {station.status === 'Locked' ? (
                    <>
                      <Unlock className="w-3 h-3" />
                      <span>{t('devices.unlock')}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>{t('devices.lock')}</span>
                    </>
                  )}
                </button>
                <button className="py-1.5 px-3 rounded-lg text-xs font-medium bg-cyber-card border border-cyber-border hover:border-cyber-borderLight text-cyber-textMuted hover:text-cyber-textMain transition-all">
                  {t('devices.viewDetails')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

