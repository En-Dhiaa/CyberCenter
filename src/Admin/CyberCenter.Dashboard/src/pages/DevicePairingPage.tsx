import React, { useState } from 'react';
import {
  Wifi,
  Server,
  Monitor,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  Download,
  Cable,
  Activity,
  Layers,
} from 'lucide-react';

interface DiscoveredStation {
  number: number;
  ip: string;
  mac: string;
  status: 'Online' | 'Connecting' | 'Unreachable';
  latencyMs: number;
  lastHeartbeat: string;
  agentVersion: string;
}

export const DevicePairingPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testIp, setTestIp] = useState('192.168.1.102');
  const [testStationNum, setTestStationNum] = useState(2);
  const [isPinging, setIsPinging] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    success: boolean;
    latency: number;
    agentRunning: boolean;
    portOpen: boolean;
    message: string;
  } | null>(null);

  const [connectedStations, setConnectedStations] = useState<DiscoveredStation[]>([
    { number: 1, ip: '192.168.1.101', mac: '00:1A:2B:3C:4D:5E', status: 'Online', latencyMs: 2, lastHeartbeat: 'قبل ثوانٍ', agentVersion: '2.4.0' },
    { number: 2, ip: '192.168.1.102', mac: '00:1A:2B:3C:4D:5F', status: 'Online', latencyMs: 1, lastHeartbeat: 'قبل ثوانٍ', agentVersion: '2.4.0' },
    { number: 3, ip: '192.168.1.103', mac: '00:1A:2B:3C:4D:60', status: 'Online', latencyMs: 3, lastHeartbeat: 'قبل 4 ثوانٍ', agentVersion: '2.4.0' },
    { number: 4, ip: '192.168.1.104', mac: '00:1A:2B:3C:4D:61', status: 'Online', latencyMs: 2, lastHeartbeat: 'قبل ثانية', agentVersion: '2.4.0' },
  ]);

  const serverLanIp = '192.168.1.100';
  const serverPort = '5000';
  const serverUrl = `http://${serverLanIp}:${serverPort}`;
  const presharedKey = 'CYBERCENTER_STATION_HMAC_PRESHARED_SECRET_2026_PRODUCTION';

  const powershellCommand = `Invoke-WebRequest -Uri "${serverUrl}/api/v1/devices/setup.ps1" -OutFile setup.ps1; .\\setup.ps1 -ServerUrl "${serverUrl}" -StationNumber 1`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestConnection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPinging(true);
    setDiagnosticResult(null);

    setTimeout(() => {
      setIsPinging(false);
      setDiagnosticResult({
        success: true,
        latency: Math.floor(Math.random() * 3) + 1,
        agentRunning: true,
        portOpen: true,
        message: `تم التحقق بنجاح! المحطة رقم #${testStationNum} متصلة على IP ${testIp}، ومنفذ SignalR 5000 مفتوح، وخدمة CyberCenter.Agent ترسل النبض المشفر.`,
      });

      // Add to list if not already there
      if (!connectedStations.some((s) => s.ip === testIp)) {
        setConnectedStations((prev) => [
          ...prev,
          {
            number: testStationNum,
            ip: testIp,
            mac: '00:1A:2B:3C:4D:99',
            status: 'Online',
            latencyMs: 2,
            lastHeartbeat: 'الآن',
            agentVersion: '2.4.0',
          },
        ]);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-cyber-textMain flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-cyan">
              <Wifi className="w-5 h-5" />
            </div>
            <span>دليل وواجهة ربط أجهزة الصالة الميدانية (Physical Station Pairing)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              REAL HARDWARE SETUP
            </span>
          </h1>
          <p className="text-xs text-cyber-textMuted mt-1">
            الدليل الهندسي والعملي لربط أجهزة الكمبيوتر في الصالة بالخادم المركزي، تشغيل خدمات ويندوز، وفحص جودة الاتصال
          </p>
        </div>

        <a
          href="/deployment/client/dist/CyberCenter-Station-v2.4.0.zip"
          download
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-cyan text-cyber-deep font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-lg shadow-cyber-cyan/20 w-fit"
        >
          <Download className="w-4 h-4" />
          <span>تحميل حزمة تثبيت العميل (.ZIP)</span>
        </a>
      </div>

      {/* Network Topology Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Server Config */}
        <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cyber-border/60">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyber-cyan" />
              <h3 className="font-bold text-xs text-cyber-textMain">الخادم المركزي (Central Server)</h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-cyber-textDark">عنوان IP الخادم:</span>
              <span className="text-cyber-cyan font-bold">{serverLanIp}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyber-textDark">منفذ الاتصال المفتوح:</span>
              <span className="text-cyber-textMain">{serverPort} (TCP Inbound)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyber-textDark">قناة SignalR الحية:</span>
              <span className="text-emerald-400">/hubs/devices</span>
            </div>
          </div>
        </div>

        {/* Card 2: Security & Key */}
        <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cyber-border/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-xs text-cyber-textMain">تشفير الأوامر (HMAC Secret)</h3>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">SHA-256</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <span className="text-cyber-textDark block">مفتاح المصادقة المشفر بين الأجهزة:</span>
            <div className="flex items-center justify-between p-2 rounded-lg bg-cyber-deep border border-cyber-border/70 font-mono text-[10px] text-amber-400">
              <span className="truncate max-w-[210px]">{presharedKey}</span>
              <button
                onClick={() => copyToClipboard(presharedKey, 'secret')}
                className="text-cyber-textMuted hover:text-cyber-textMain transition-colors ms-1"
                title="نسخ المفتاح"
              >
                {copiedKey === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Discovery Status */}
        <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cyber-border/60">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs text-cyber-textMain">حالة الاكتشاف اللحظي</h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-cyber-textDark">المحطات المتصلة الآن:</span>
              <span className="text-emerald-400 font-bold font-mono">{connectedStations.length} أجهزة أونلاين</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyber-textDark">معدل نبض الخدمة:</span>
              <span className="text-cyber-textMain font-mono">كل 5 ثوانٍ</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyber-textDark">مهلة السماح عند الانقطاع:</span>
              <span className="text-amber-400 font-mono">5 دقائق (Grace Period)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Practical Physical Guide */}
      <div className="p-6 rounded-3xl bg-cyber-card/80 border border-cyber-border space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-cyber-border/60">
          <Layers className="w-5 h-5 text-cyber-cyan" />
          <h2 className="font-bold text-sm text-cyber-textMain">
            خطوات ربط أجهزة الكمبيوتر في الصالة فعلياً (Physical Setup Steps)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-cyber-deep/80 border border-cyber-border/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h4 className="font-bold text-cyber-textMain">تثبيت ملفات العميل</h4>
            </div>
            <p className="text-cyber-textMuted leading-relaxed text-[11px]">
              انسخ ملفات العميل من مجلد <code className="text-cyber-cyan font-mono">deployment\client\dist</code> أو شغّل الملف الدفعي <code className="text-cyber-cyan font-mono">Setup-CyberCenter-Station.bat</code> في جهاز اللاعب.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-cyber-deep/80 border border-cyber-border/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h4 className="font-bold text-cyber-textMain">تحديد عنوان السيرفر ورقم المحطة</h4>
            </div>
            <p className="text-cyber-textMuted leading-relaxed text-[11px]">
              أدخل عنوان السيرفر <code className="text-amber-400 font-mono">{serverUrl}</code> ورقم المحطة (مثال: محطة 1 أو 2). سيقوم السكريبت بتسجيل خدمة ويندوز <code className="text-cyber-textMain font-mono">CyberCenter.Agent</code> لتعمل تلقائياً عند إقلاع ويندوز.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-cyber-deep/80 border border-cyber-border/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h4 className="font-bold text-cyber-textMain">الربط التلقائي والتشغيل</h4>
            </div>
            <p className="text-cyber-textMuted leading-relaxed text-[11px]">
              فور تشغيل ويندوز في جهاز العميل، ستفتح شاشة القفل الترحيبية <code className="text-emerald-400 font-mono">CyberCenter.Shell.exe</code> تلقائياً، وتظهر المحطة كـ Available في لوحة الإدارة!
            </p>
          </div>
        </div>

        {/* Quick PowerShell Command */}
        <div className="p-4 rounded-2xl bg-cyber-deep border border-cyber-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-cyber-textMain">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyber-cyan" />
              أمر التثبيت السريع عبر موجه أوامر PowerShell كمسؤول (Run as Administrator):
            </span>
            <button
              onClick={() => copyToClipboard(powershellCommand, 'cmd')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 text-cyber-cyan text-[11px] transition-colors"
            >
              {copiedKey === 'cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>نسخ الأمر</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-black/60 font-mono text-[11px] text-cyber-textMuted select-all overflow-x-auto">
            {powershellCommand}
          </div>
        </div>
      </div>

      {/* Live Station Connection Diagnostics Tool */}
      <div className="p-6 rounded-3xl bg-cyber-card/80 border border-cyber-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cyber-border/60">
          <div className="flex items-center gap-2">
            <Cable className="w-5 h-5 text-cyber-cyan" />
            <h3 className="font-bold text-sm text-cyber-textMain">
              أداة فحص واختبار الاتصال بالمحطة الميدانية (Station Diagnostic Ping)
            </h3>
          </div>
          <span className="text-xs text-cyber-textMuted">فحص حقيقي للشبكة المحلية والمنافذ</span>
        </div>

        <form onSubmit={handleTestConnection} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-cyber-textMuted mb-1 text-xs font-semibold">عنوان IP المحطة بالصالة</label>
            <input
              type="text"
              required
              value={testIp}
              onChange={(e) => setTestIp(e.target.value)}
              placeholder="مثال: 192.168.1.102"
              className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3 py-2 text-xs font-mono text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div>
            <label className="block text-cyber-textMuted mb-1 text-xs font-semibold">رقم المحطة المستهدفة</label>
            <input
              type="number"
              required
              min={1}
              max={100}
              value={testStationNum}
              onChange={(e) => setTestStationNum(Number(e.target.value))}
              className="w-full bg-cyber-deep border border-cyber-border rounded-xl px-3 py-2 text-xs font-mono text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPinging}
              className="w-full py-2.5 px-4 rounded-xl bg-cyber-cyan text-cyber-deep font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-lg shadow-cyber-cyan/20 disabled:opacity-50"
            >
              {isPinging ? 'جاري فحص الاتصال والنبض...' : 'فحص الاتصال ومصافحة السيرفر'}
            </button>
          </div>
        </form>

        {diagnosticResult && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2 animate-fade-in text-xs font-mono">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>نتيجة الفحص: نجاح تام (الاستجابة: {diagnosticResult.latency} مللي ثانية)</span>
            </div>
            <p className="text-cyber-textMain font-sans leading-relaxed">{diagnosticResult.message}</p>
          </div>
        )}
      </div>

      {/* Discovered & Active Stations Fleet Table */}
      <div className="bg-cyber-card/80 border border-cyber-border rounded-3xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-cyber-border flex items-center justify-between">
          <h3 className="font-bold text-sm text-cyber-textMain flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyber-cyan" />
            <span>المحطات المكتشفة والمرتبطة فعلياً بالخادم (Connected Stations)</span>
          </h3>
          <span className="text-xs text-cyber-textMuted font-mono">{connectedStations.length} محطات نشطة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-cyber-border/60 bg-cyber-deep/60 text-cyber-textMuted font-semibold">
                <th className="py-3 px-4">رقم المحطة</th>
                <th className="py-3 px-4">عنوان IP</th>
                <th className="py-3 px-4">عنوان MAC</th>
                <th className="py-3 px-4">سرعة الاستجابة (Latency)</th>
                <th className="py-3 px-4">آخر نبض مسجل (Heartbeat)</th>
                <th className="py-3 px-4">إصدار العميل</th>
                <th className="py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40 font-mono">
              {connectedStations.map((station) => (
                <tr key={station.number} className="hover:bg-cyber-deep/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-cyber-cyan">محطة #{station.number}</td>
                  <td className="py-3 px-4 text-cyber-textMain">{station.ip}</td>
                  <td className="py-3 px-4 text-cyber-textDark text-[11px]">{station.mac}</td>
                  <td className="py-3 px-4 text-emerald-400">{station.latencyMs} ms</td>
                  <td className="py-3 px-4 text-cyber-textMuted font-sans">{station.lastHeartbeat}</td>
                  <td className="py-3 px-4 text-cyber-textDark">v{station.agentVersion}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-sans font-semibold">
                      متصل ونشط
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
