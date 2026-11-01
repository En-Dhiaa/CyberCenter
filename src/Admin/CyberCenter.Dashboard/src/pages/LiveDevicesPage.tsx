import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Monitor,
  Search,
  Lock,
  Unlock,
  RotateCcw,
  Power,
  MessageSquare,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Shield,
  LayoutGrid,
  List,
  Cpu,
  HardDrive,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge, DeviceStatus } from '@/components/ui/StatusBadge';

interface StationDetails {
  id: string;
  number: number;
  name: string;
  group: string;
  status: DeviceStatus;
  user?: string;
  remainingMinutes?: number;
  ip: string;
  mac: string;
  cpu: string;
  ram: string;
  gpu: string;
  downMbps: number;
  upMbps: number;
  totalDataGb: number;
}

const initialFleet: StationDetails[] = [
  { id: '1', number: 1, name: 'VIP-Station-01', group: 'VIP Lounge', status: 'Occupied', user: 'عمر القحطاني', remainingMinutes: 84, ip: '192.168.1.101', mac: '00:1A:2B:3C:4D:5E', cpu: 'i9-14900K', ram: '32GB DDR5', gpu: 'RTX 4080', downMbps: 12.4, upMbps: 2.1, totalDataGb: 3.4 },
  { id: '2', number: 2, name: 'VIP-Station-02', group: 'VIP Lounge', status: 'Occupied', user: 'أحمد السامعي', remainingMinutes: 35, ip: '192.168.1.102', mac: '00:1A:2B:3C:4D:5F', cpu: 'i9-14900K', ram: '32GB DDR5', gpu: 'RTX 4080', downMbps: 24.8, upMbps: 4.5, totalDataGb: 5.1 },
  { id: '3', number: 3, name: 'Pro-Station-03', group: 'Pro Arena', status: 'Available', ip: '192.168.1.103', mac: '00:1A:2B:3C:4D:60', cpu: 'i7-14700K', ram: '32GB DDR5', gpu: 'RTX 4070 Ti', downMbps: 0.1, upMbps: 0.0, totalDataGb: 0.2 },
  { id: '4', number: 4, name: 'Pro-Station-04', group: 'Pro Arena', status: 'Occupied', user: 'كرت مؤقت #8921', remainingMinutes: 12, ip: '192.168.1.104', mac: '00:1A:2B:3C:4D:61', cpu: 'i7-14700K', ram: '32GB DDR5', gpu: 'RTX 4070 Ti', downMbps: 45.2, upMbps: 8.7, totalDataGb: 12.8 },
  { id: '5', number: 5, name: 'Pro-Station-05', group: 'Pro Arena', status: 'Reserved', ip: '192.168.1.105', mac: '00:1A:2B:3C:4D:62', cpu: 'i7-14700K', ram: '32GB DDR5', gpu: 'RTX 4070 Ti', downMbps: 0.0, upMbps: 0.0, totalDataGb: 0.0 },
  { id: '6', number: 6, name: 'Main-Station-06', group: 'Main Hall', status: 'Locked', ip: '192.168.1.106', mac: '00:1A:2B:3C:4D:63', cpu: 'i5-13600K', ram: '16GB DDR4', gpu: 'RTX 3060 Ti', downMbps: 0.0, upMbps: 0.0, totalDataGb: 0.0 },
  { id: '7', number: 7, name: 'Main-Station-07', group: 'Main Hall', status: 'Available', ip: '192.168.1.107', mac: '00:1A:2B:3C:4D:64', cpu: 'i5-13600K', ram: '16GB DDR4', gpu: 'RTX 3060 Ti', downMbps: 0.2, upMbps: 0.0, totalDataGb: 0.1 },
  { id: '8', number: 8, name: 'Main-Station-08', group: 'Main Hall', status: 'Offline', ip: '192.168.1.108', mac: '00:1A:2B:3C:4D:65', cpu: 'i5-13600K', ram: '16GB DDR4', gpu: 'RTX 3060 Ti', downMbps: 0.0, upMbps: 0.0, totalDataGb: 0.0 },
];

export const LiveDevicesPage: React.FC = () => {
  const { t } = useTranslation();
  const [fleet, setFleet] = useState<StationDetails[]>(initialFleet);
  const [selectedStation, setSelectedStation] = useState<StationDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DeviceStatus>('All');
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal actions state
  const [messageText, setMessageText] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 3000);
  };

  const toggleLock = (id: string) => {
    setFleet((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next: DeviceStatus = s.status === 'Locked' ? 'Available' : 'Locked';
        return { ...s, status: next };
      })
    );
    if (selectedStation && selectedStation.id === id) {
      setSelectedStation((prev) =>
        prev ? { ...prev, status: prev.status === 'Locked' ? 'Available' : 'Locked' } : null
      );
    }
    showAlert('تم إرسال وتوقيع أمر تغيير حالة المحطة بنجاح.');
  };

  const extendTime = (id: string, minutes: number) => {
    setFleet((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const current = s.remainingMinutes || 0;
        return { ...s, remainingMinutes: current + minutes };
      })
    );
    if (selectedStation && selectedStation.id === id) {
      setSelectedStation((prev) =>
        prev ? { ...prev, remainingMinutes: (prev.remainingMinutes || 0) + minutes } : null
      );
    }
    showAlert(`تم تمديد الجلسة +${minutes} دقيقة وتحديث عقد الإيجار (Lease).`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedStation) return;
    showAlert(`تم إرسال رسالة التنبيه إلى المحطة #${selectedStation.number} بنجاح.`);
    setMessageText('');
    setShowMessageBox(false);
  };

  const handleReboot = (station: StationDetails) => {
    if (confirm(`هل أنت متأكد من رغبتك في إعادة تشغيل المحطة #${station.number}؟`)) {
      showAlert(`تم إرسال أمر إعادة التشغيل الموقّع للمحطة #${station.number}.`);
      setSelectedStation(null);
    }
  };

  const handleShutdown = (station: StationDetails) => {
    if (confirm(`هل أنت متأكد من رغبتك في إيقاف تشغيل المحطة #${station.number}؟`)) {
      showAlert(`تم إرسال أمر إيقاف التشغيل الكامل للمحطة #${station.number}.`);
      setSelectedStation(null);
    }
  };

  const filteredFleet = fleet.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.number.toString().includes(searchTerm) ||
      (s.user && s.user.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesGroup = groupFilter === 'All' || s.group === groupFilter;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-cyber-textMain flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-cyan">
              <Monitor className="w-5 h-5" />
            </div>
            <span>{t('nav.liveDevices')}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              FLEET CONTROLLER v1.0
            </span>
          </h1>
          <p className="text-xs text-cyber-textMuted mt-1">
            مراقبة وتحكم فوري في أسطول المحطات، الأوامر الموقعة، واستهلاك الشبكة اللحظي
          </p>
        </div>

        {/* View Toggle & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {actionAlert && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionAlert}</span>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-cyber-textDark absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالرقم أو الاسم أو العميل..."
              className="bg-cyber-card border border-cyber-border rounded-xl ps-9 pe-4 py-2 text-xs text-cyber-textMain placeholder:text-cyber-textDark focus:outline-none focus:border-cyber-cyan/50 font-sans"
            />
          </div>

          {/* Grid vs Table Switch */}
          <div className="flex items-center bg-cyber-deep p-1 rounded-xl border border-cyber-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyber-card text-cyber-cyan shadow-sm' : 'text-cyber-textDark hover:text-cyber-textMain'}`}
              title="عرض الشبكة (Grid View)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-cyber-card text-cyber-cyan shadow-sm' : 'text-cyber-textDark hover:text-cyber-textMain'}`}
              title="عرض الجدول (Table View)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs (Groups & Statuses) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-cyber-deep p-1 rounded-xl border border-cyber-border">
          {(['All', 'Available', 'Occupied', 'Locked', 'Offline'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? 'bg-cyber-cyan text-black font-bold shadow-sm'
                  : 'text-cyber-textMuted hover:text-cyber-textMain'
              }`}
            >
              {st === 'All' ? 'كل الحالات' : t(`status.${st}`)}
            </button>
          ))}
        </div>

        {/* Zone Groups */}
        <div className="flex items-center gap-2">
          <span className="text-cyber-textDark text-[11px]">المنطقة:</span>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="bg-cyber-card border border-cyber-border rounded-xl px-3 py-1.5 text-xs text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
          >
            <option value="All">جميع المناطق (All Zones)</option>
            <option value="VIP Lounge">VIP Lounge (صالة المحترفين)</option>
            <option value="Pro Arena">Pro Arena (منطقة البطولات)</option>
            <option value="Main Hall">Main Hall (الصالة العامة)</option>
          </select>
        </div>
      </div>

      {/* View Mode 1: Fleet Cards Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFleet.map((station) => (
            <div
              key={station.id}
              onClick={() => setSelectedStation(station)}
              className="cursor-pointer bg-cyber-card/90 border border-cyber-border hover:border-cyber-cyan/50 rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/20 group flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-cyber-border/50">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-cyber-deep border border-cyber-border flex items-center justify-center font-mono font-bold text-xs text-cyber-cyan group-hover:border-cyber-cyan/40">
                    #{station.number}
                  </span>
                  <div>
                    <h4 className="font-semibold text-xs text-cyber-textMain leading-tight">{station.name}</h4>
                    <span className="text-[10px] text-cyber-textDark">{station.group}</span>
                  </div>
                </div>
                <StatusBadge status={station.status} size="sm" />
              </div>

              {/* Hardware Quick Tags */}
              <div className="py-2.5 flex items-center gap-1.5 text-[10px] font-mono text-cyber-textDark border-b border-cyber-border/30">
                <span className="bg-cyber-deep px-1.5 py-0.5 rounded border border-cyber-border/40">{station.gpu}</span>
                <span className="bg-cyber-deep px-1.5 py-0.5 rounded border border-cyber-border/40">{station.ram}</span>
              </div>

              {/* User & Time Display */}
              <div className="py-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-cyber-textDark">العميل:</span>
                  <span className="font-medium text-cyber-textMain truncate max-w-[130px]">{station.user || '—'}</span>
                </div>
                {station.remainingMinutes !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-cyber-textDark flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyber-cyan" />
                      المتبقي:
                    </span>
                    <span className="font-mono font-bold text-cyber-cyan">
                      {station.remainingMinutes} دقيقة
                    </span>
                  </div>
                )}
              </div>

              {/* Network Bandwidth */}
              <div className="flex items-center justify-between text-[11px] font-mono text-cyber-textDark pt-2 border-t border-cyber-border/40">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ArrowDownLeft className="w-3 h-3" /> {station.downMbps} Mbps
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <ArrowUpRight className="w-3 h-3" /> {station.upMbps} Mbps
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* View Mode 2: Fleet Table View */
        <div className="bg-cyber-card/80 border border-cyber-border rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-start text-xs">
            <thead className="bg-cyber-deep/80 text-cyber-textDark border-b border-cyber-border uppercase text-[10px] font-semibold tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4 text-start">المحطة</th>
                <th className="py-3.5 px-4 text-start">المنطقة</th>
                <th className="py-3.5 px-4 text-start">الحالة</th>
                <th className="py-3.5 px-4 text-start">العميل الحالي</th>
                <th className="py-3.5 px-4 text-start">الوقت المتبقي</th>
                <th className="py-3.5 px-4 text-start">السرعة اللحظية</th>
                <th className="py-3.5 px-4 text-start">عنوان IP</th>
                <th className="py-3.5 px-4 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {filteredFleet.map((station) => (
                <tr key={station.id} className="hover:bg-cyber-deep/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyber-deep border border-cyber-border flex items-center justify-center font-mono font-bold text-[11px] text-cyber-cyan">
                        #{station.number}
                      </span>
                      <span className="font-semibold text-cyber-textMain">{station.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-cyber-textMuted">{station.group}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={station.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-cyber-textMain">{station.user || '—'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-cyber-cyan">
                    {station.remainingMinutes !== undefined ? `${station.remainingMinutes} د` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-cyber-textDark">
                    ↓ {station.downMbps} / ↑ {station.upMbps} Mbps
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-cyber-textDark">{station.ip}</td>
                  <td className="py-3.5 px-4 text-end">
                    <button
                      onClick={() => setSelectedStation(station)}
                      className="px-3 py-1 rounded-lg bg-cyber-deep border border-cyber-border hover:border-cyber-cyan/40 text-cyber-cyan text-xs font-semibold"
                    >
                      تحكم
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Modal Drawer for Selected Station Control */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-cyber-deep border border-cyber-borderLight rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyber-card border border-cyber-border flex items-center justify-center font-mono font-bold text-lg text-cyber-cyan shadow-inner">
                  #{selectedStation.number}
                </div>
                <div>
                  <h3 className="font-bold text-base text-cyber-textMain">{selectedStation.name}</h3>
                  <p className="text-xs text-cyber-textDark font-mono">
                    {selectedStation.group} • {selectedStation.ip} • {selectedStation.mac}
                  </p>
                </div>
              </div>
              <StatusBadge status={selectedStation.status} />
            </div>

            {/* Hardware & Spec Details */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-cyber-card rounded-2xl border border-cyber-border text-center text-xs">
              <div className="space-y-0.5">
                <p className="text-cyber-textDark text-[10px] flex items-center justify-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400" /> المعالج
                </p>
                <p className="font-semibold text-cyber-textMain font-mono">{selectedStation.cpu}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-cyber-textDark text-[10px] flex items-center justify-center gap-1">
                  <HardDrive className="w-3 h-3 text-emerald-400" /> الذاكرة
                </p>
                <p className="font-semibold text-cyber-textMain font-mono">{selectedStation.ram}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-cyber-textDark text-[10px] flex items-center justify-center gap-1">
                  <Monitor className="w-3 h-3 text-purple-400" /> كرت الشاشة
                </p>
                <p className="font-semibold text-cyber-textMain font-mono">{selectedStation.gpu}</p>
              </div>
            </div>

            {/* Quick Extension and Messaging Buttons */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-cyber-textDark uppercase tracking-wider">
                التحكم الميداني الفوري (Station Actions)
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* Lock / Unlock */}
                <button
                  onClick={() => toggleLock(selectedStation.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    selectedStation.status === 'Locked'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  {selectedStation.status === 'Locked' ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>فك قفل المحطة</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>قفل المحطة فوراً</span>
                    </>
                  )}
                </button>

                {/* Extend Time */}
                <button
                  onClick={() => extendTime(selectedStation.id, 30)}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-cyber-card border border-cyber-border text-cyber-cyan hover:border-cyber-cyan/50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>تمديد (+30 دقيقة)</span>
                </button>

                {/* Send Notification Message Trigger */}
                <button
                  onClick={() => setShowMessageBox(!showMessageBox)}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-cyber-card border border-cyber-border text-cyber-textMuted hover:text-cyber-textMain flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>إرسال تنبيه للعميل</span>
                </button>

                {/* Reboot Computer */}
                <button
                  onClick={() => handleReboot(selectedStation)}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-cyber-card border border-cyber-border text-amber-400 hover:border-amber-400/50 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة تشغيل المحطة</span>
                </button>
              </div>

              {/* Message Box Input (Collapsible) */}
              {showMessageBox && (
                <form onSubmit={handleSendMessage} className="p-3 bg-cyber-card rounded-xl border border-cyber-border space-y-2 text-xs">
                  <label className="block text-cyber-textMuted font-semibold">نص رسالة التنبيه:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="e.g. يرجى التوجه للاستقبال / قرب انتهاء وقت الوردية"
                      className="flex-1 bg-cyber-deep border border-cyber-border rounded-xl px-3 py-1.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-cyber-cyan text-black font-bold flex items-center gap-1 shadow-glow-cyan"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Shutdown Button */}
              <button
                onClick={() => handleShutdown(selectedStation)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Power className="w-4 h-4" />
                <span>إيقاف التشغيل الكامل للجهاز (Remote Shutdown)</span>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-cyber-border flex justify-between items-center text-xs">
              <span className="text-cyber-textDark flex items-center gap-1 font-mono">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Agent v1.0.4 • Signed Command Channel
              </span>
              <button
                onClick={() => {
                  setSelectedStation(null);
                  setShowMessageBox(false);
                }}
                className="px-4 py-2 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-borderLight text-cyber-textMain font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
