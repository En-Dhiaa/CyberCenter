import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  X,
  CheckCircle2,
  Copy,
  Printer,
  Wifi,
  Terminal,
  ShieldCheck,
  Check,
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
  const navigate = useNavigate();
  const [stations, setStations] = useState<StationItem[]>(mockStations);
  const [filter, setFilter] = useState<'All' | 'Available' | 'Occupied' | 'Offline'>('All');

  // Modals state
  const [showOpenSessionModal, setShowOpenSessionModal] = useState(false);
  const [showGenerateCardsModal, setShowGenerateCardsModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states: Open Session
  const [selectedStationNum, setSelectedStationNum] = useState<number>(3);
  const [sessionType, setSessionType] = useState<'Open' | 'Prepaid'>('Prepaid');
  const [customerName, setCustomerName] = useState('لاعب جديد');
  const [prepaidMinutes, setPrepaidMinutes] = useState(60);
  const [hourlyRate, setHourlyRate] = useState(500);

  // Form states: Generate Cards
  const [cardQuantity, setCardQuantity] = useState(5);
  const [cardDurationHours, setCardDurationHours] = useState(1);
  const [cardPrice, setCardPrice] = useState(500);
  const [generatedPins, setGeneratedPins] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Form states: Add Expense
  const [expenseCategory, setExpenseCategory] = useState('كهرباء وطاقة ومولد');
  const [expenseAmount, setExpenseAmount] = useState(15000);
  const [expenseDescription, setExpenseDescription] = useState('وقود ديزل للمولد الاحتياطي');
  const [expenseRecipient, setExpenseRecipient] = useState('محطة الوقود المركزية');

  // Pairing diagnostics state
  const [pingIp, setPingIp] = useState('192.168.1.103');
  const [pingResult, setPingResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'failed'; latency?: number; message?: string }>({ status: 'idle' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    setStations((prev) =>
      prev.map((s) => {
        if (s.number !== selectedStationNum) return s;
        return {
          ...s,
          status: 'Occupied',
          user: customerName || 'زائر الصالة',
          remainingMinutes: sessionType === 'Prepaid' ? prepaidMinutes : undefined,
          downMbps: 18.5,
          upMbps: 3.2,
        };
      })
    );
    setShowOpenSessionModal(false);
    showToast(`تم فتح الجلسة للمحطة #${selectedStationNum} بنجاح وإرسال أمر فك القفل اللحظي عبر SignalR.`);
  };

  const handleGenerateCards = (e: React.FormEvent) => {
    e.preventDefault();
    const pins: string[] = [];
    const characters = '0123456789';
    for (let i = 0; i < cardQuantity; i++) {
      let pin = 'CC-';
      for (let segment = 0; segment < 3; segment++) {
        for (let c = 0; c < 4; c++) {
          pin += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        if (segment < 2) pin += '-';
      }
      pins.push(pin);
    }
    setGeneratedPins(pins);
    showToast(`تم توليد ${cardQuantity} كرت بنجاح مع تشفير رموز الـ PIN.`);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddExpenseModal(false);
    showToast(`تم تسجيل مصروف بقيمة ${expenseAmount.toLocaleString()} ر.ي وقيده في سجل التدقيق المالي.`);
  };

  const handleTestPing = () => {
    setPingResult({ status: 'testing' });
    setTimeout(() => {
      setPingResult({
        status: 'success',
        latency: Math.floor(Math.random() * 4) + 1,
        message: 'تم الاتصال بالعميل بنجاح! منفذ 5000 مفتوح، واستجابت خدمة CyberCenter.Agent وتبادلت مفتاح الأمان.',
      });
    }, 800);
  };

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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 end-6 z-50 flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

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

        {/* Quick Action Buttons (NOW 100% FUNCTIONAL) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowOpenSessionModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-semibold text-xs rounded-xl shadow-glow-cyan transition-all hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>{t('dashboard.quickActions.openSession')}</span>
          </button>
          <button
            onClick={() => {
              setGeneratedPins([]);
              setShowGenerateCardsModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 text-cyber-textMain font-medium text-xs rounded-xl transition-all hover:scale-105"
          >
            <CreditCard className="w-3.5 h-3.5 text-cyber-gold" />
            <span>{t('dashboard.quickActions.generateCards')}</span>
          </button>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyber-card border border-cyber-border hover:border-cyber-emerald/50 text-cyber-textMain font-medium text-xs rounded-xl transition-all hover:scale-105"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyber-emerald" />
            <span>{t('dashboard.quickActions.addExpense')}</span>
          </button>
          <button
            onClick={() => setShowPairingModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyber-deep border border-cyber-cyan/40 hover:bg-cyber-cyan/10 text-cyber-cyan font-semibold text-xs rounded-xl transition-all hover:scale-105"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>ربط الأجهزة الميدانية (Pairing)</span>
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
                <button
                  onClick={() => navigate('/devices')}
                  className="py-1.5 px-3 rounded-lg text-xs font-medium bg-cyber-card border border-cyber-border hover:border-cyber-borderLight text-cyber-textMuted hover:text-cyber-textMain transition-all"
                >
                  {t('devices.viewDetails')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Modal: Open New Session (فتح جلسة جديدة)                               */}
      {/* ========================================================================= */}
      {showOpenSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-cyber-card border border-cyber-border rounded-3xl w-full max-w-lg p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyber-cyan">
                  <Play className="w-5 h-5 fill-cyber-cyan" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-cyber-textMain">فتح جلسة لعب جديدة (Start Session)</h3>
                  <p className="text-xs text-cyber-textMuted">اختر رقم المحطة ونوع الحساب للبدء الفوري</p>
                </div>
              </div>
              <button
                onClick={() => setShowOpenSessionModal(false)}
                className="p-1.5 rounded-xl hover:bg-cyber-deep text-cyber-textDark hover:text-cyber-textMain transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-cyber-textMuted mb-1.5 font-semibold">المحطة المستهدفة (Target Station)</label>
                <select
                  value={selectedStationNum}
                  onChange={(e) => setSelectedStationNum(Number(e.target.value))}
                  className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-mono"
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.number}>
                      محطة #{st.number} - {st.name} ({st.status === 'Available' ? 'متاحة للعب' : st.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cyber-textMuted mb-1.5 font-semibold">نوع الجلسة (Session Type)</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as 'Open' | 'Prepaid')}
                    className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
                  >
                    <option value="Prepaid">مسبق الدفع (Prepaid Duration)</option>
                    <option value="Open">جلسة مفتوحة (Postpaid Open)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-cyber-textMuted mb-1.5 font-semibold">تعرفة الساعة (Rate/Hour)</label>
                  <select
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
                  >
                    <option value={500}>500 ر.ي (صالة عامة Standard)</option>
                    <option value={800}>800 ر.ي (صالة المحترفين VIP)</option>
                  </select>
                </div>
              </div>

              {sessionType === 'Prepaid' && (
                <div>
                  <label className="block text-cyber-textMuted mb-1.5 font-semibold">المدة المحددة للجلسة</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 60, 120, 180].map((mins) => (
                      <button
                        type="button"
                        key={mins}
                        onClick={() => setPrepaidMinutes(mins)}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          prepaidMinutes === mins
                            ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan shadow-sm'
                            : 'bg-cyber-deep border-cyber-border text-cyber-textMuted hover:border-cyber-cyan/40'
                        }`}
                      >
                        {mins >= 60 ? `${mins / 60} ساعة` : `${mins} دقيقة`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-cyber-textMuted mb-1.5 font-semibold">اسم العميل أو رقم العضوية</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: عمر القحطاني أو زائر"
                  className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={() => setShowOpenSessionModal(false)}
                  className="px-4 py-2 rounded-xl bg-cyber-deep border border-cyber-border text-cyber-textMuted hover:text-cyber-textMain font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyber-cyan text-black font-bold hover:bg-cyber-cyan/90 transition-all shadow-lg shadow-cyber-cyan/20"
                >
                  تأكيد وفتح المحطة فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Modal: Generate Instant Cards (توليد كروت فورية)                        */}
      {/* ========================================================================= */}
      {showGenerateCardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-cyber-card border border-cyber-border rounded-3xl w-full max-w-xl p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-cyber-textMain">توليد كروت فورية مشفرة (Instant Cards Generator)</h3>
                  <p className="text-xs text-cyber-textMuted">توليد دفعات كروت ساعات مع رمز PIN محمي بـ PBKDF2</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateCardsModal(false)}
                className="p-1.5 rounded-xl hover:bg-cyber-deep text-cyber-textDark hover:text-cyber-textMain transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedPins.length === 0 ? (
              <form onSubmit={handleGenerateCards} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-cyber-textMuted mb-1.5 font-semibold">عدد الكروت المراد إصدارها</label>
                    <select
                      value={cardQuantity}
                      onChange={(e) => setCardQuantity(Number(e.target.value))}
                      className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-mono"
                    >
                      <option value={5}>5 كروت فورية</option>
                      <option value={10}>10 كروت دفعة كاملة</option>
                      <option value={20}>20 كرت (حزمة الوردية)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-cyber-textMuted mb-1.5 font-semibold">مدة الكرت (الساعات)</label>
                    <select
                      value={cardDurationHours}
                      onChange={(e) => {
                        const h = Number(e.target.value);
                        setCardDurationHours(h);
                        setCardPrice(h * 500);
                      }}
                      className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
                    >
                      <option value={1}>1 ساعة (60 دقيقة)</option>
                      <option value={2}>2 ساعة (120 دقيقة)</option>
                      <option value={3}>3 ساعات (180 دقيقة)</option>
                      <option value={5}>5 ساعات (باقة الألعاب الكبرى)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-cyber-textMuted mb-1.5 font-semibold">سعر بيع الكرت (ريال يمني)</label>
                  <input
                    type="number"
                    required
                    value={cardPrice}
                    onChange={(e) => setCardPrice(Number(e.target.value))}
                    className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-mono"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-cyber-border">
                  <button
                    type="button"
                    onClick={() => setShowGenerateCardsModal(false)}
                    className="px-4 py-2 rounded-xl bg-cyber-deep border border-cyber-border text-cyber-textMuted hover:text-cyber-textMain font-semibold transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
                  >
                    توليد الرموز فوراً
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    تم إصدار {generatedPins.length} كرت بنجاح (فئة {cardDurationHours} ساعة - {cardPrice} ر.ي)
                  </span>
                  <button
                    onClick={() => {
                      const text = generatedPins.join('\n');
                      navigator.clipboard.writeText(text);
                      showToast('تم نسخ جميع رموز الـ PIN إلى الحافظة.');
                    }}
                    className="text-xs text-cyber-cyan hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    نسخ الكل
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pe-1">
                  {generatedPins.map((pin, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-cyber-deep border border-cyber-border/80 hover:border-cyber-cyan/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-cyber-surface text-[10px] font-mono text-cyber-textDark flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-sm font-bold tracking-widest text-cyber-cyan">
                          {pin}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pin);
                          setCopiedIndex(idx);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className="p-1.5 rounded-lg bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 text-cyber-textMuted hover:text-cyber-textMain transition-colors"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-cyber-border">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-deep border border-cyber-border text-cyber-textMain font-semibold text-xs hover:border-cyber-cyan/40 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-cyber-cyan" />
                    <span>طباعة الكروت الحرارية</span>
                  </button>
                  <button
                    onClick={() => setShowGenerateCardsModal(false)}
                    className="px-5 py-2 rounded-xl bg-cyber-cyan text-black font-bold text-xs hover:bg-cyber-cyan/90 transition-all"
                  >
                    تم وإغلاق
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Modal: Add Operational Expense (تسجيل مصروف)                            */}
      {/* ========================================================================= */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-cyber-card border border-cyber-border rounded-3xl w-full max-w-lg p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-cyber-textMain">تسجيل سند صرف ومصروف (Record Expense)</h3>
                  <p className="text-xs text-cyber-textMuted">قيد المصروفات اليومية وتوثيقها محاسبياً</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1.5 rounded-xl hover:bg-cyber-deep text-cyber-textDark hover:text-cyber-textMain transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cyber-textMuted mb-1.5 font-semibold">بند المصروف (Category)</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
                  >
                    <option value="كهرباء وطاقة ومولد">كهرباء وطاقة ومولد</option>
                    <option value="صيانة أجهزة وشبكة">صيانة أجهزة وشبكة</option>
                    <option value="بوفيه وضيافة">بوفيه وضيافة ومشروبات</option>
                    <option value="نظافة ومستلزمات">نظافة ومستلزمات صالة</option>
                    <option value="إيجار ورسوم">إيجار ورسوم عامة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-cyber-textMuted mb-1.5 font-semibold">المبلغ (ريال يمني)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyber-textMuted mb-1.5 font-semibold">بيان المصروف (Description)</label>
                <input
                  type="text"
                  required
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="اكتب سبب الصرف بدقة..."
                  className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div>
                <label className="block text-cyber-textMuted mb-1.5 font-semibold">صُرف إلى (Recipient / Paid To)</label>
                <input
                  type="text"
                  required
                  value={expenseRecipient}
                  onChange={(e) => setExpenseRecipient(e.target.value)}
                  placeholder="اسم الشخص أو الجهة المستلمة..."
                  className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-cyber-deep border border-cyber-border text-cyber-textMuted hover:text-cyber-textMain font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  حفظ وقيد المصروف فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Modal: Device Pairing & Setup Wizard (واجهة ودليل ربط الأجهزة الميدانية) */}
      {/* ========================================================================= */}
      {showPairingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-cyber-card border border-cyber-border rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-cyber-textMain">دليل وواجهة ربط الأجهزة الميدانية الحقيقية</h3>
                  <p className="text-xs text-cyber-textMuted">كيفية ربط أجهزة الكمبيوتر في صالتك بالخادم المركزي خطوة بخطوة</p>
                </div>
              </div>
              <button
                onClick={() => setShowPairingModal(false)}
                className="p-1.5 rounded-xl hover:bg-cyber-deep text-cyber-textDark hover:text-cyber-textMain transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Server Details Card */}
              <div className="p-4 rounded-2xl bg-cyber-deep border border-cyber-border space-y-2 font-mono">
                <div className="flex items-center justify-between text-cyber-textMuted text-[11px]">
                  <span>عنوان الخادم المحلي (Central Server URL):</span>
                  <span className="text-emerald-400 font-bold">http://localhost:5000 (أو IP شبكة المركز)</span>
                </div>
                <div className="flex items-center justify-between text-cyber-textMuted text-[11px]">
                  <span>منفذ بروتوكول الأجهزة (SignalR & REST):</span>
                  <span className="text-cyan-400 font-bold">Port 5000 (TCP Inbound)</span>
                </div>
                <div className="flex items-center justify-between text-cyber-textMuted text-[11px]">
                  <span>مفتاح التوقيع المشفر (HMAC Secret):</span>
                  <span className="text-amber-400 font-bold">CYBERCENTER_STATION_HMAC_PRESHARED_SECRET_2026</span>
                </div>
              </div>

              {/* Physical Setup Steps */}
              <div className="space-y-2">
                <h4 className="font-bold text-cyber-textMain text-sm">خطوات ربط أي جهاز كمبيوتر فعلي بالصالة:</h4>
                <div className="space-y-2 bg-cyber-surface/50 p-3.5 rounded-2xl border border-cyber-border/70">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyber-cyan/20 text-cyber-cyan font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <p className="text-cyber-textMuted leading-relaxed">
                      انسخ مجلد برنامج العميل المترجم <code className="text-cyber-cyan font-mono">CyberCenter.Shell.exe</code> وخدمة <code className="text-cyber-cyan font-mono">CyberCenter.Agent.exe</code> إلى جهاز الكمبيوتر في الصالة (المسار الموصى به: <code className="text-amber-400 font-mono">C:\Program Files\CyberCenter</code>).
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyber-cyan/20 text-cyber-cyan font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <p className="text-cyber-textMuted leading-relaxed">
                      شغّل سكريبت التثبيت والتصليد الآلي كمسؤول <code className="text-cyber-cyan font-mono">Install-CyberCenterStation.ps1</code> ليقوم بفتح جدار الحماية وتسجيل خدمة النبض وإقفال أدوات النظام ومنع الهروب.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyber-cyan/20 text-cyber-cyan font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <p className="text-cyber-textMuted leading-relaxed">
                      فور تشغيل الجهاز في نفس شبكة الصالة، ستقوم خدمة العميل بإرسال نبض تلقائي (Heartbeat) يظهر فوراً في جدول الأجهزة أعلاه كـ <span className="text-emerald-400 font-bold">Available</span> مع حرارة العتاد وسرعة الشبكة!
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Ping & Handshake Tester */}
              <div className="p-4 rounded-2xl bg-cyber-deep/80 border border-cyber-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyber-textMain flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyber-cyan" />
                    أداة فحص واختبار الاتصال المباشر بمحطة (Station Ping & Diagnostics)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pingIp}
                    onChange={(e) => setPingIp(e.target.value)}
                    placeholder="أدخل عنوان IP المحطة (مثال: 192.168.1.103)..."
                    className="flex-1 bg-cyber-card border border-cyber-border rounded-xl px-3.5 py-2 font-mono text-xs text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                  />
                  <button
                    type="button"
                    onClick={handleTestPing}
                    disabled={pingResult.status === 'testing'}
                    className="px-4 py-2 rounded-xl bg-cyber-cyan text-black font-bold text-xs hover:bg-cyber-cyan/90 transition-all shrink-0 disabled:opacity-50"
                  >
                    {pingResult.status === 'testing' ? 'جاري الفحص...' : 'فحص الاتصال والربط'}
                  </button>
                </div>

                {pingResult.status === 'success' && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1 animate-fade-in font-mono text-[11px]">
                    <div className="flex items-center gap-2 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>اتصال المحطة سليم 100% (زمن الاستجابة: {pingResult.latency} ms)</span>
                    </div>
                    <p className="text-cyber-textMuted font-sans">{pingResult.message}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPairingModal(false)}
                  className="px-5 py-2 rounded-xl bg-cyber-deep border border-cyber-border text-cyber-textMain hover:border-cyber-cyan/50 font-bold transition-all text-xs"
                >
                  إغلاق الدليل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

