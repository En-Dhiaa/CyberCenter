import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Router,
  Wifi,
  Shield,
  Sliders,
  X,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StationNetworkItem {
  id: string;
  stationNumber: number;
  stationName: string;
  downloadSpeed: number;
  uploadSpeed: number;
  totalDownloadedGb: number;
  totalUploadedGb: number;
  pingMs: number;
  isThrottled: boolean;
  limitMbps?: number;
}

const initialStations: StationNetworkItem[] = [
  { id: '1', stationNumber: 1, stationName: 'VIP-Station-01', downloadSpeed: 64.2, uploadSpeed: 12.8, totalDownloadedGb: 18.4, totalUploadedGb: 4.2, pingMs: 3, isThrottled: false },
  { id: '2', stationNumber: 2, stationName: 'VIP-Station-02', downloadSpeed: 48.5, uploadSpeed: 9.1, totalDownloadedGb: 14.1, totalUploadedGb: 3.1, pingMs: 4, isThrottled: false },
  { id: '3', stationNumber: 3, stationName: 'Station-03', downloadSpeed: 32.0, uploadSpeed: 6.4, totalDownloadedGb: 9.8, totalUploadedGb: 2.0, pingMs: 3, isThrottled: true, limitMbps: 35 },
  { id: '4', stationNumber: 4, stationName: 'Station-04', downloadSpeed: 72.4, uploadSpeed: 15.2, totalDownloadedGb: 24.6, totalUploadedGb: 6.5, pingMs: 4, isThrottled: false },
  { id: '5', stationNumber: 5, stationName: 'Station-05', downloadSpeed: 1.2, uploadSpeed: 0.4, totalDownloadedGb: 4.2, totalUploadedGb: 0.8, pingMs: 2, isThrottled: false },
  { id: '6', stationNumber: 6, stationName: 'Station-06', downloadSpeed: 0.0, uploadSpeed: 0.0, totalDownloadedGb: 0.0, totalUploadedGb: 0.0, pingMs: 0, isThrottled: false },
  { id: '7', stationNumber: 7, stationName: 'Station-07', downloadSpeed: 41.0, uploadSpeed: 8.0, totalDownloadedGb: 11.2, totalUploadedGb: 2.8, pingMs: 4, isThrottled: false },
  { id: '8', stationNumber: 8, stationName: 'Station-08', downloadSpeed: 28.5, uploadSpeed: 5.6, totalDownloadedGb: 8.5, totalUploadedGb: 1.9, pingMs: 3, isThrottled: false },
];

const trafficHistory = [
  { time: '16:00', download: 120, upload: 28 },
  { time: '16:10', download: 185, upload: 38 },
  { time: '16:20', download: 240, upload: 52 },
  { time: '16:30', download: 210, upload: 46 },
  { time: '16:40', download: 295, upload: 64 },
  { time: '16:50', download: 287, upload: 58 },
];

export const NetworkMonitorPage: React.FC = () => {
  const { t } = useTranslation();
  const [stations, setStations] = useState<StationNetworkItem[]>(initialStations);
  const [selectedStation, setSelectedStation] = useState<StationNetworkItem | null>(null);
  const [customLimit, setCustomLimit] = useState(30);

  const totalDown = stations.reduce((acc, s) => acc + s.downloadSpeed, 0);
  const totalUp = stations.reduce((acc, s) => acc + s.uploadSpeed, 0);

  const handleApplyThrottle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation) return;

    setStations((prev) =>
      prev.map((s) => {
        if (s.id === selectedStation.id) {
          return {
            ...s,
            isThrottled: customLimit > 0,
            limitMbps: customLimit > 0 ? customLimit : undefined,
          };
        }
        return s;
      })
    );
    setSelectedStation(null);
  };

  const handleUnthrottle = (id: string) => {
    setStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isThrottled: false, limitMbps: undefined } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <Activity className="w-7 h-7 text-cyan-400" />
            {t('مراقبة الشبكة وتدفق البيانات (Network Monitor)')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('مراقبة سرعات التحميل والرفع اللحظية لكل محطة، استهلاك الباندويث، وتقييد السرعات')}
          </p>
        </div>

        {/* Router Gateway Health Badge */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
          <Router className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold text-slate-200">MikroTik CCR2004 (192.168.1.1)</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              الراوتر متصل • RouterOS v7.14
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('إجمالي سرعة التحميل اللحظية')}</span>
            <ArrowDown className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400">{totalDown.toFixed(1)}</span>
            <span className="text-xs text-slate-500">Mbps</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('إجمالي سرعة الرفع اللحظية')}</span>
            <ArrowUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-400">{totalUp.toFixed(1)}</span>
            <span className="text-xs text-slate-500">Mbps</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('معدل البنج للألعاب (Ping)')}</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">3 - 4</span>
            <span className="text-xs text-slate-500">ms (Fiber Optics)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('المحطات المقيدة السرعة')}</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{stations.filter((s) => s.isThrottled).length}</span>
            <span className="text-xs text-slate-500">{t('محطة محددة السقف')}</span>
          </div>
        </div>
      </div>

      {/* Traffic Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-base">{t('مخطط استهلاك الباندويث اللحظي (WAN Throughput)')}</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficHistory}>
              <defs>
                <linearGradient id="netDown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="netUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} tickFormatter={(val) => `${val}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0A0E17', borderColor: '#334155', borderRadius: 8 }}
                formatter={(val: any) => [`${val} Mbps`, '']}
              />
              <Area type="monotone" dataKey="download" name="التحميل (Download)" stroke="#06B6D4" fillOpacity={1} fill="url(#netDown)" strokeWidth={2} />
              <Area type="monotone" dataKey="upload" name="الرفع (Upload)" stroke="#A855F7" fillOpacity={1} fill="url(#netUp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stations Network Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('المحطة')}</th>
                <th className="px-4 py-3 font-semibold">{t('السرعة اللحظية')}</th>
                <th className="px-4 py-3 font-semibold">{t('إجمالي البيانات المستهلكة')}</th>
                <th className="px-4 py-3 font-semibold">{t('الاستجابة (Ping)')}</th>
                <th className="px-4 py-3 font-semibold">{t('سقف السرعة (Throttling)')}</th>
                <th className="px-4 py-3 font-semibold text-center">{t('التحكم')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {stations.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      {s.stationName}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-cyan-400 flex items-center gap-1 font-bold">
                        <ArrowDown className="w-3.5 h-3.5" />
                        {s.downloadSpeed} Mbps
                      </span>
                      <span className="text-purple-400 flex items-center gap-1">
                        <ArrowUp className="w-3.5 h-3.5" />
                        {s.uploadSpeed} Mbps
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-xs font-mono text-slate-400">
                    <span className="text-slate-200 font-bold">{s.totalDownloadedGb} GB</span> تح /{' '}
                    <span>{s.totalUploadedGb} GB</span> رف
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {s.pingMs > 0 ? `${s.pingMs} ms` : '-'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    {s.isThrottled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Shield className="w-3 h-3" />
                        محدد بـ {s.limitMbps} Mbps
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">غير مقيد (Full Speed)</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedStation(s);
                          setCustomLimit(s.limitMbps || 30);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                        title="تعديل سقف السرعة"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>

                      {s.isThrottled && (
                        <button
                          onClick={() => handleUnthrottle(s.id)}
                          className="px-2 py-1 rounded text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 transition"
                          title="إلغاء التحديد"
                        >
                          إلغاء السقف
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Throttle Modal */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>تحديد سرعة {selectedStation.stationName}</span>
              </h3>
              <button
                onClick={() => setSelectedStation(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyThrottle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  الحد الأقصى للتحميل (Mbps)
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  step="5"
                  value={customLimit}
                  onChange={(e) => setCustomLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-base font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex gap-2 mt-2">
                  {[15, 25, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomLimit(preset)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 hover:bg-slate-700"
                    >
                      {preset}M
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedStation(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-cyan-500/20"
                >
                  تطبيق السقف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
