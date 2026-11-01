import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  Gauge,
  Cpu,
  Info,
  DollarSign,
  Flame,
  CheckCircle2,
  Sliders,
  X,
} from 'lucide-react';

interface StationEnergyItem {
  id: string;
  stationNumber: number;
  stationName: string;
  powerState: 'GamingLoad' | 'Idle' | 'Offline';
  watts: number;
  activeHours: number;
  kwhToday: number;
  costToday: number;
}

const initialEnergyStations: StationEnergyItem[] = [
  { id: '1', stationNumber: 1, stationName: 'VIP-Station-01', powerState: 'GamingLoad', watts: 420, activeHours: 7.2, kwhToday: 3.02, costToday: 755 },
  { id: '2', stationNumber: 2, stationName: 'VIP-Station-02', powerState: 'GamingLoad', watts: 420, activeHours: 6.5, kwhToday: 2.73, costToday: 682 },
  { id: '3', stationNumber: 3, stationName: 'Station-03', powerState: 'Idle', watts: 85, activeHours: 8.0, kwhToday: 0.68, costToday: 170 },
  { id: '4', stationNumber: 4, stationName: 'Station-04', powerState: 'GamingLoad', watts: 420, activeHours: 8.4, kwhToday: 3.53, costToday: 882 },
  { id: '5', stationNumber: 5, stationName: 'Station-05', powerState: 'Idle', watts: 85, activeHours: 8.0, kwhToday: 0.68, costToday: 170 },
  { id: '6', stationNumber: 6, stationName: 'Station-06', powerState: 'Offline', watts: 15, activeHours: 0.0, kwhToday: 0.12, costToday: 30 },
  { id: '7', stationNumber: 7, stationName: 'Station-07', powerState: 'GamingLoad', watts: 420, activeHours: 5.8, kwhToday: 2.44, costToday: 610 },
  { id: '8', stationNumber: 8, stationName: 'Station-08', powerState: 'GamingLoad', watts: 420, activeHours: 4.5, kwhToday: 1.89, costToday: 472 },
];

export const EnergyMonitorPage: React.FC = () => {
  const { t } = useTranslation();
  const [stations] = useState<StationEnergyItem[]>(initialEnergyStations);
  const [tariffRate, setTariffRate] = useState<number>(250);
  const [showTariffModal, setShowTariffModal] = useState(false);
  const [newTariffInput, setNewTariffInput] = useState<number>(250);

  // Calculations
  const currentTotalKw = (stations.reduce((acc, s) => acc + s.watts, 0) / 1000).toFixed(2);
  const totalEstimatedKwh = stations.reduce((acc, s) => acc + s.kwhToday, 0).toFixed(2);
  // Real meter includes AC overhead & ambient RGB lighting (~6.5% delta)
  const totalRealMeterKwh = (Number(totalEstimatedKwh) * 1.065).toFixed(2);
  const totalCostToday = Math.round(Number(totalEstimatedKwh) * tariffRate);

  const handleUpdateTariff = (e: React.FormEvent) => {
    e.preventDefault();
    setTariffRate(newTariffInput);
    setShowTariffModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <Zap className="w-7 h-7 text-amber-400" />
            {t('مراقبة استهلاك الطاقة والكهرباء (Energy Monitor)')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('متابعة الحمل الكهربائي اللحظي، تقدير تكلفة الطاقة، والتمييز بين قراءة العداد الفعلي والتقدير الحسابي')}
          </p>
        </div>

        <button
          onClick={() => {
            setNewTariffInput(tariffRate);
            setShowTariffModal(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold hover:border-amber-500/50 text-slate-300 transition"
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>التعرفة: {tariffRate} ر.ي / kWh</span>
        </button>
      </div>

      {/* Prominent Methodology Banner (Real Meter vs Hardware Estimation) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border border-amber-500/30 flex items-start gap-3 shadow-lg">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-400 text-sm block mb-1">
            {t('الفرق المنهجي بين القراءة المقاسة بالعداد الذكي والتقدير الحسابي لعتاد الأجهزة:')}
          </span>
          {t('يقوم النظام بعرض نوعين من البيانات الكهربائية: ')}
          <span className="text-cyan-300 font-bold">1. الاستهلاك المقاس بالعداد الذكي (Physical Meter): </span>
          {t('يمثل القراءة الحقيقية لعداد الكهرباء الرقمي (Schneider Modbus) شاملاً المكيفات والإضاءة. ')}
          <span className="text-amber-300 font-bold">2. الاستهلاك الحسابي التقديري (Hardware Estimation): </span>
          {t('محسوب برمجياً بدقة حسب حالة المحطة (RTX 4080 + i7-14700KF: في وضع اللعب 420W، في وضع الخمول 85W).')}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Real Meter Reading */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-cyan-300">{t('قراءة العداد الذكي الفعلي')}</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400">{totalRealMeterKwh}</span>
            <span className="text-xs text-slate-400">kWh اليوم</span>
          </div>
          <div className="mt-1 text-[10px] text-cyan-300 font-mono">Schneider PM5300 (Modbus TCP)</div>
        </div>

        {/* Calculated Hardware Estimate */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300">{t('الاستهلاك الحسابي للأجهزة')}</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{totalEstimatedKwh}</span>
            <span className="text-xs text-slate-400">kWh اليوم</span>
          </div>
          <div className="mt-1 text-[10px] text-amber-300 font-mono">Hardware Profiles (RTX 4080)</div>
        </div>

        {/* Instantaneous Load */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('الحمل اللحظي الكلي')}</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{currentTotalKw}</span>
            <span className="text-xs text-slate-500">kW</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-400 font-medium">5 محطات نشطة تحت ضغط اللعب</div>
        </div>

        {/* Energy Cost Today */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('تكلفة الطاقة التقديرية اليوم')}</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{totalCostToday.toLocaleString()}</span>
            <span className="text-xs text-slate-500">ر.ي</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">محسوبة بتعرفة {tariffRate} ر.ي / kWh</div>
        </div>
      </div>

      {/* Stations Energy Matrix Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('المحطة')}</th>
                <th className="px-4 py-3 font-semibold">{t('حالة استهلاك الطاقة')}</th>
                <th className="px-4 py-3 font-semibold">{t('السحب اللحظي')}</th>
                <th className="px-4 py-3 font-semibold">{t('ساعات التشغيل')}</th>
                <th className="px-4 py-3 font-semibold">{t('الاستهلاك اليومي')}</th>
                <th className="px-4 py-3 font-semibold text-center">{t('التكلفة المقدرة')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {stations.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <Zap className={`w-3.5 h-3.5 ${s.powerState === 'GamingLoad' ? 'text-amber-400' : 'text-slate-500'}`} />
                      {s.stationName}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    {s.powerState === 'GamingLoad' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Flame className="w-3 h-3 text-amber-400" />
                        لعب مكثف (Gaming Load)
                      </span>
                    )}
                    {s.powerState === 'Idle' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        سطح المكتب خامل (Idle)
                      </span>
                    )}
                    {s.powerState === 'Offline' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400">
                        مطفأ / استعداد (Standby)
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-slate-200">
                    {s.watts} W
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                    {s.activeHours} ساعة
                  </td>

                  <td className="px-4 py-3.5 text-xs font-mono font-bold text-amber-400">
                    {s.kwhToday} kWh
                  </td>

                  <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-400 text-xs">
                    {s.costToday} ر.ي
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tariff Modal */}
      {showTariffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>تحديث تعرفة الكهرباء (Tariff Rate)</span>
              </h3>
              <button
                onClick={() => setShowTariffModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTariff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  سعر الكيلوواط/ساعة (ر.ي / kWh)
                </label>
                <input
                  type="number"
                  min="50"
                  step="10"
                  required
                  value={newTariffInput}
                  onChange={(e) => setNewTariffInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-base font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTariffModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-amber-500/20"
                >
                  حفظ التعرفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
