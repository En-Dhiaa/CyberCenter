import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  History,
  Play,
  Clock,
  DollarSign,
  Plus,
  Square,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface ActiveSessionItem {
  id: string;
  stationNumber: number;
  stationName: string;
  sessionType: 'Open' | 'TemporaryCard' | 'Member';
  clientName: string;
  startedAt: string;
  elapsedMinutes: number;
  remainingMinutes?: number;
  accruedCost: number;
}

interface ArchivedSessionItem {
  id: string;
  stationNumber: number;
  clientName: string;
  sessionType: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  totalCost: number;
  reason: string;
}

const mockActiveSessions: ActiveSessionItem[] = [
  { id: '1', stationNumber: 1, stationName: 'VIP-Station-01', sessionType: 'Member', clientName: 'عمر القحطاني (@omar99)', startedAt: '15:10', elapsedMinutes: 52, remainingMinutes: 84, accruedCost: 0 },
  { id: '2', stationNumber: 2, stationName: 'VIP-Station-02', sessionType: 'Open', clientName: 'أحمد السامعي (جلسة مفتوحة)', startedAt: '15:25', elapsedMinutes: 37, accruedCost: 493 },
  { id: '3', stationNumber: 4, stationName: 'Pro-Station-04', sessionType: 'TemporaryCard', clientName: 'كرت مؤقت CC-****-8921', startedAt: '15:45', elapsedMinutes: 18, remainingMinutes: 12, accruedCost: 0 },
];

const mockArchivedSessions: ArchivedSessionItem[] = [
  { id: '101', stationNumber: 3, clientName: 'زائر - كرت مؤقت #4412', sessionType: 'TemporaryCard', startedAt: '13:00', endedAt: '15:00', durationMinutes: 120, totalCost: 1000, reason: 'Time Expired' },
  { id: '102', stationNumber: 7, clientName: 'محمد العمري', sessionType: 'Open', startedAt: '12:30', endedAt: '14:45', durationMinutes: 135, totalCost: 1125, reason: 'Client Paid & Left' },
  { id: '103', stationNumber: 5, clientName: 'خالد التميمي (@khaled)', sessionType: 'Member', startedAt: '11:00', endedAt: '13:30', durationMinutes: 150, totalCost: 0, reason: 'Manual Sign Out' },
];

export const SessionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeSessions, setActiveSessions] = useState<ActiveSessionItem[]>(mockActiveSessions);
  const [archivedSessions] = useState<ArchivedSessionItem[]>(mockArchivedSessions);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  // Start Open Session Modal
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedStationNum, setSelectedStationNum] = useState(3);
  const [openSessionNotes, setOpenSessionNotes] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleStartOpenSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: ActiveSessionItem = {
      id: Date.now().toString(),
      stationNumber: selectedStationNum,
      stationName: `Station-${selectedStationNum.toString().padStart(2, '0')}`,
      sessionType: 'Open',
      clientName: openSessionNotes ? `عميل (${openSessionNotes})` : 'جلسة مفتوحة',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 0,
      accruedCost: 0,
    };
    setActiveSessions((prev) => [newSession, ...prev]);
    setShowStartModal(false);
    setOpenSessionNotes('');
    notify(`تم فتح جلسة جديدة للمحطة #${selectedStationNum} بنجاح.`);
  };

  const handleExtend = (id: string, mins: number) => {
    setActiveSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remainingMinutes: (s.remainingMinutes || 0) + mins } : s))
    );
    notify(`تم تمديد وقت الجلسة +${mins} دقيقة.`);
  };

  const handleTerminate = (id: string, stationNumber: number) => {
    if (confirm(`هل أنت متأكد من رغبتك في إنهاء الجلسة للمحطة #${stationNumber}؟`)) {
      setActiveSessions((prev) => prev.filter((s) => s.id !== id));
      notify(`تم إنهاء الجلسة وقفل المحطة #${stationNumber}.`);
    }
  };

  const filteredActive = activeSessions.filter(
    (s) =>
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.stationNumber.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-cyber-textMain flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-cyan">
              <History className="w-5 h-5" />
            </div>
            <span>{t('nav.sessions')}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              TIME & LEASE ENGINE
            </span>
          </h1>
          <p className="text-xs text-cyber-textMuted mt-1">
            إدارة الجلسات المفتوحة، كروت الدقائق، جلسات الأعضاء، واحتساب التكاليف والوقت بدقة الخادم
          </p>
        </div>

        {/* Global Action & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {actionNotice && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionNotice}</span>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-cyber-textDark absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالمحطة أو العميل..."
              className="bg-cyber-card border border-cyber-border rounded-xl ps-9 pe-4 py-2 text-xs text-cyber-textMain placeholder:text-cyber-textDark focus:outline-none focus:border-cyber-cyan/50 font-sans"
            />
          </div>

          <button
            onClick={() => setShowStartModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold text-xs shadow-glow-cyan hover:from-cyan-400 hover:to-cyan-300 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>فتح جلسة جديدة</span>
          </button>
        </div>
      </div>

      {/* Tabs: Active Sessions vs History */}
      <div className="flex items-center gap-2 border-b border-cyber-border/60 text-xs font-medium pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'active'
              ? 'bg-cyber-cyan/15 border border-cyber-cyan/40 text-cyber-cyan font-bold'
              : 'text-cyber-textMuted hover:text-cyber-textMain'
            }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>الجلسات النشطة حالياً ({activeSessions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'history'
              ? 'bg-cyber-cyan/15 border border-cyber-cyan/40 text-cyber-cyan font-bold'
              : 'text-cyber-textMuted hover:text-cyber-textMain'
            }`}
        >
          <Calendar className="w-4 h-4" />
          <span>أرشيف الجلسات المكتملة</span>
        </button>
      </div>

      {/* Active Sessions Grid */}
      {activeTab === 'active' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActive.map((s) => (
            <div
              key={s.id}
              className="bg-cyber-card/80 border border-cyber-border hover:border-cyber-borderLight rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-cyber-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyber-deep border border-cyber-border flex items-center justify-center font-mono font-bold text-cyber-cyan text-sm">
                    #{s.stationNumber}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-cyber-textMain">{s.stationName}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-deep border border-cyber-border text-cyber-textMuted">
                      {s.sessionType === 'Open' ? 'جلسة مفتوحة' : s.sessionType === 'TemporaryCard' ? 'كرت مؤقت' : 'عضوية'}
                    </span>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>نشطة</span>
                </span>
              </div>

              {/* Client & Time Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-cyber-textDark">العميل:</span>
                  <span className="font-semibold text-cyber-textMain truncate max-w-[180px]">{s.clientName}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-cyber-textDark flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyber-cyan" /> وقت البدء:
                  </span>
                  <span className="text-cyber-textMuted">{s.startedAt} ({s.elapsedMinutes} د مضت)</span>
                </div>
                {s.remainingMinutes !== undefined ? (
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-cyber-textDark">المتبقي:</span>
                    <span className="font-bold text-cyber-cyan text-sm">{s.remainingMinutes} دقيقة</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-cyber-textDark flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-cyber-gold" /> التكلفة حتى الآن:
                    </span>
                    <span className="font-bold text-cyber-gold text-sm">{s.accruedCost} ر.ي</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-cyber-border/50 flex items-center gap-2">
                <button
                  onClick={() => handleExtend(s.id, 30)}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyber-deep border border-cyber-border hover:border-cyber-cyan/40 text-cyber-cyan text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تمديد +30 د</span>
                </button>
                <button
                  onClick={() => handleTerminate(s.id, s.stationNumber)}
                  className="py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>إنهاء</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* History Archive Table */
        <div className="bg-cyber-card/80 border border-cyber-border rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-start text-xs font-mono">
            <thead className="bg-cyber-deep/80 text-cyber-textDark border-b border-cyber-border uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-start font-sans">المحطة</th>
                <th className="py-3.5 px-4 text-start font-sans">العميل</th>
                <th className="py-3.5 px-4 text-start font-sans">النوع</th>
                <th className="py-3.5 px-4 text-start font-sans">البداية ➔ النهاية</th>
                <th className="py-3.5 px-4 text-start font-sans">المدة الإجمالية</th>
                <th className="py-3.5 px-4 text-start font-sans">المبلغ المحتسب</th>
                <th className="py-3.5 px-4 text-end font-sans">سبب الإغلاق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {archivedSessions.map((row) => (
                <tr key={row.id} className="hover:bg-cyber-deep/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyber-cyan">#{row.stationNumber}</td>
                  <td className="py-3.5 px-4 font-sans text-cyber-textMain">{row.clientName}</td>
                  <td className="py-3.5 px-4 text-cyber-textMuted">{row.sessionType}</td>
                  <td className="py-3.5 px-4 text-cyber-textDark">{row.startedAt} ➔ {row.endedAt}</td>
                  <td className="py-3.5 px-4 font-bold text-cyber-textMain">{row.durationMinutes} دقيقة</td>
                  <td className="py-3.5 px-4 text-cyber-gold font-bold">{row.totalCost} ر.ي</td>
                  <td className="py-3.5 px-4 text-end font-sans text-cyber-textDark">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Start Open Session Modal Dialog */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-deep border border-cyber-borderLight rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <h3 className="font-bold text-base text-cyber-textMain">فتح جلسة تشغيل جديدة</h3>
              <button onClick={() => setShowStartModal(false)} className="text-cyber-textDark hover:text-cyber-textMain">✕</button>
            </div>

            <form onSubmit={handleStartOpenSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-cyber-textMuted mb-1 font-semibold">المحطة المستهدفة</label>
                <select
                  value={selectedStationNum}
                  onChange={(e) => setSelectedStationNum(Number(e.target.value))}
                  className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                >
                  <option value={3}>Station #03 (Pro Arena - متاح)</option>
                  <option value={5}>Station #05 (Pro Arena - محجوز)</option>
                  <option value={7}>Station #07 (Main Hall - متاح)</option>
                </select>
              </div>

              <div>
                <label className="block text-cyber-textMuted mb-1 font-semibold">ملاحظات / اسم العميل (اختياري)</label>
                <input
                  type="text"
                  value={openSessionNotes}
                  onChange={(e) => setOpenSessionNotes(e.target.value)}
                  placeholder="e.g. عميل طاولة 3 / دفع لاحق"
                  className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
                />
              </div>

              <div className="p-3 bg-cyber-card rounded-xl border border-cyber-border text-cyber-textMuted space-y-1">
                <p className="flex items-center gap-1.5 text-cyber-cyan font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" /> سياسة الجلسة المفتوحة:
                </p>
                <p className="text-[11px]">
                  سيتم فك قفل سطح المكتب فورياً، وبدء احتساب الوقت المتراكم وفق تسعيرة المحطة، ولا تنتهي إلا بإغلاق الإدارة يدوياً.
                </p>
              </div>

              <div className="pt-3 border-t border-cyber-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-cyber-textMuted hover:text-cyber-textMain"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyber-cyan text-black font-bold hover:bg-cyan-400 shadow-glow-cyan"
                >
                  بدء الجلسة الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
