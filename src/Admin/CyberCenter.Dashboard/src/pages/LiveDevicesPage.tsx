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
  SlidersHorizontal,
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

  const toggleLock = (id: string) => {
    setFleet((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next: DeviceStatus = s.status === 'Locked' ? 'Available' : 'Locked';
        return { ...s, status: next };
      })
    );
  };

  const filteredFleet = fleet.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.number.toString().includes(searchTerm) ||
      (s.user && s.user.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-cyber-textMain flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyber-cyan" />
            <span>{t('nav.liveDevices')}</span>
          </h1>
          <p className="text-xs text-cyber-textMuted mt-0.5">
            مراقبة وتحكم فوري في أسطول المحطات، الأوامر الموقعة، وحالة الـ Agent
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-cyber-textDark absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالرقم أو الاسم أو المستخدم..."
              className="bg-cyber-card border border-cyber-border rounded-xl ps-9 pe-4 py-1.5 text-xs text-cyber-textMain placeholder:text-cyber-textDark focus:outline-none focus:border-cyber-cyan/50 font-sans"
            />
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-card border border-cyber-border text-xs text-cyber-textMuted hover:text-cyber-textMain">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فلترة</span>
          </button>
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFleet.map((station) => (
          <div
            key={station.id}
            onClick={() => setSelectedStation(station)}
            className="cursor-pointer bg-cyber-card/90 border border-cyber-border hover:border-cyber-cyan/50 rounded-xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/20 group"
          >
            {/* Station Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border/50">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-cyber-deep border border-cyber-border flex items-center justify-center font-mono font-bold text-xs text-cyber-cyan group-hover:border-cyber-cyan/40">
                  #{station.number}
                </span>
                <div>
                  <h4 className="font-semibold text-xs text-cyber-textMain leading-tight">{station.name}</h4>
                  <span className="text-[10px] text-cyber-textDark">{station.group}</span>
                </div>
              </div>
              <StatusBadge status={station.status} size="sm" />
            </div>

            {/* Hardware & Spec Micro-tags */}
            <div className="py-2.5 flex items-center gap-2 text-[10px] font-mono text-cyber-textDark border-b border-cyber-border/30">
              <span className="bg-cyber-deep px-1.5 py-0.5 rounded">{station.gpu}</span>
              <span className="bg-cyber-deep px-1.5 py-0.5 rounded">{station.ram}</span>
            </div>

            {/* Active User & Duration */}
            <div className="py-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-cyber-textDark">المستخدم:</span>
                <span className="font-medium text-cyber-textMain">{station.user || '—'}</span>
              </div>
              {station.remainingMinutes !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-cyber-textDark flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyber-cyan" />
                    المتبقي:
                  </span>
                  <span className="font-mono font-bold text-cyber-cyan">
                    {station.remainingMinutes} دقيقة
                  </span>
                </div>
              )}
            </div>

            {/* Network Speeds */}
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

      {/* Interactive Modal Drawer for Selected Station */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-deep border border-cyber-borderLight rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyber-card border border-cyber-border flex items-center justify-center font-mono font-bold text-cyber-cyan">
                  #{selectedStation.number}
                </div>
                <div>
                  <h3 className="font-bold text-base text-cyber-textMain">{selectedStation.name}</h3>
                  <p className="text-xs text-cyber-textDark font-mono">{selectedStation.ip} • {selectedStation.mac}</p>
                </div>
              </div>
              <StatusBadge status={selectedStation.status} />
            </div>

            {/* Hardware Specs Details */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-cyber-card rounded-xl border border-cyber-border text-center text-xs">
              <div>
                <p className="text-cyber-textDark text-[10px]">المعالج</p>
                <p className="font-semibold text-cyber-textMain mt-0.5">{selectedStation.cpu}</p>
              </div>
              <div>
                <p className="text-cyber-textDark text-[10px]">الذاكرة</p>
                <p className="font-semibold text-cyber-textMain mt-0.5">{selectedStation.ram}</p>
              </div>
              <div>
                <p className="text-cyber-textDark text-[10px]">كرت الشاشة</p>
                <p className="font-semibold text-cyber-textMain mt-0.5">{selectedStation.gpu}</p>
              </div>
            </div>

            {/* Remote Command Actions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-cyber-textDark uppercase tracking-wider">
                الأوامر الموقعة للجهاز (Signed Remote Commands)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleLock(selectedStation.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
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

                <button className="py-2 px-3 rounded-xl text-xs font-semibold bg-cyber-card border border-cyber-border text-cyber-cyan hover:border-cyber-cyan/40 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>تمديد الوقت (+30 د)</span>
                </button>

                <button className="py-2 px-3 rounded-xl text-xs font-semibold bg-cyber-card border border-cyber-border text-cyber-textMuted hover:text-cyber-textMain flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>إرسال رسالة تنبيه</span>
                </button>

                <button className="py-2 px-3 rounded-xl text-xs font-semibold bg-cyber-card border border-cyber-border text-amber-400 hover:border-amber-400/40 flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة تشغيل الجهاز</span>
                </button>

                <button className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 col-span-2 flex items-center justify-center gap-2">
                  <Power className="w-4 h-4" />
                  <span>إيقاف التشغيل الكامل (Shutdown)</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-cyber-border flex justify-between items-center text-xs">
              <span className="text-cyber-textDark flex items-center gap-1 font-mono">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Agent v1.0.4 Online
              </span>
              <button
                onClick={() => setSelectedStation(null)}
                className="px-4 py-2 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-borderLight text-cyber-textMain font-medium"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

