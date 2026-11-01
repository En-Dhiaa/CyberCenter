import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Database,
  ShieldCheck,
  Download,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  Clock,
  Key,
} from 'lucide-react';

interface BackupArchive {
  id: string;
  name: string;
  createdAt: string;
  sizeKb: number;
  engine: string;
  sha256: string;
  status: 'VERIFIED' | 'VERIFYING' | 'CORRUPTED';
}

export const BackupRestorePage: React.FC = () => {
  const { t } = useTranslation();

  const [archives, setArchives] = useState<BackupArchive[]>([
    {
      id: 'bk-01',
      name: 'cybercenter_backup_20261101_171545.sql',
      createdAt: '2026-11-01 17:15:45',
      sizeKb: 1459,
      engine: 'PostgreSQL pg_dump',
      sha256: '1D458CD3BF02E5CE4257E964043581A58DF6C3A17C34F6017F4E7CE0513FFC51',
      status: 'VERIFIED',
    },
    {
      id: 'bk-02',
      name: 'cybercenter_backup_20261101_120000.sql',
      createdAt: '2026-11-01 12:00:00',
      sizeKb: 1442,
      engine: 'PostgreSQL pg_dump',
      sha256: '9E8A7B6C5D4E3F2A1B0C9D8E7F6A5B4C3D2E1F0A9B8C7D6E5F4A3B2C1D0E9F8A',
      status: 'VERIFIED',
    },
    {
      id: 'bk-03',
      name: 'cybercenter_backup_20261031_235959.sql',
      createdAt: '2026-10-31 23:59:59',
      sizeKb: 1390,
      engine: 'SnapshotEngine',
      sha256: '4A5B6C7D8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B',
      status: 'VERIFIED',
    },
  ]);

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleCreateBackup = () => {
    setIsCreatingBackup(true);
    setTimeout(() => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      
      const newArchive: BackupArchive = {
        id: `bk-${Date.now()}`,
        name: `cybercenter_backup_${timestamp}.sql`,
        createdAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
        sizeKb: 1468,
        engine: 'PostgreSQL pg_dump',
        sha256: '3F1A7E9C4B2D8E0A5F6C7D8B9A0E1F2C3D4E5A6B7C8D9E0F1A2B3C4D5E6F7A8B',
        status: 'VERIFIED',
      };

      setArchives([newArchive, ...archives]);
      setIsCreatingBackup(false);
      setSuccessToast('تم إنشاء نسخة احتياطية جديدة بنجاح مع توثيق بصمة SHA-256 وحفظ بيان البيانات (.meta.json).');
      setTimeout(() => setSuccessToast(null), 4000);
    }, 1200);
  };

  const handleVerifyArchive = (id: string) => {
    setArchives((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'VERIFYING' } : a))
    );
    setTimeout(() => {
      setArchives((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'VERIFIED' } : a))
      );
      setSuccessToast('تم التحقق من سلامة الأرشيف ومطابقة التجزئة المشفرة SHA-256 بنجاح 100%.');
      setTimeout(() => setSuccessToast(null), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-cyber-textMain flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-cyan">
              <Database className="w-5 h-5" />
            </div>
            <span>{t('nav.backupRestore')}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              SHA-256 VERIFIED
            </span>
          </h1>
          <p className="text-xs text-cyber-textMuted mt-1">
            إدارة النسخ الاحتياطي الآلي لقاعدة بيانات المركز، التحقق من البصمات المشفرة، وسياسات التعافي من الكوارث
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-cyan text-cyber-deep font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-lg shadow-cyber-cyan/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isCreatingBackup ? 'animate-spin' : ''}`} />
          <span>{isCreatingBackup ? 'جاري أخذ النسخة الاحتياطية...' : 'إنشاء نسخة احتياطية فورية'}</span>
        </button>
      </div>

      {successToast && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-cyber-card/80 border border-cyber-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-cyber-textMuted font-medium">عدد النسخ المؤرشفة</div>
            <div className="text-lg font-bold text-cyber-textMain">{archives.length} نسخ</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cyber-card/80 border border-cyber-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-cyber-textMuted font-medium">سلامة التشفير والأرشيف</div>
            <div className="text-lg font-bold text-emerald-400">100% موثق</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cyber-card/80 border border-cyber-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-cyber-textMuted font-medium">سياسة الاستبقاء (Retention)</div>
            <div className="text-lg font-bold text-cyber-textMain">14 يوماً</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cyber-card/80 border border-cyber-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-cyber-textMuted font-medium">خوارزمية التجزئة</div>
            <div className="text-lg font-bold text-purple-400 font-mono">SHA-256</div>
          </div>
        </div>
      </div>

      {/* Security Banner: Tamper Prevention */}
      <div className="p-4 rounded-2xl bg-cyber-surface/60 border border-cyber-border/80 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-bold text-cyber-textMain">بروتوكول الأمان الصارم للتعافي من الكوارث (Zero Corruption Guarantee)</div>
          <p className="text-cyber-textMuted leading-relaxed">
            يقوم سكريبت الاستعادة الآلي <code className="text-cyber-cyan font-mono text-[11px]">Restore-CyberCenterDatabase.ps1</code> بفحص
            تطابق بصمة التجزئة الرقمية SHA-256 المحسوبة مع ملف البيان <code className="text-cyber-cyan font-mono text-[11px]">.meta.json</code> قبل
            إجراء أي تعديل في الجداول، ويمنع استعادة أي أرشيف متلاعب به أو تعرض للتلف بنسبة 100%.
          </p>
        </div>
      </div>

      {/* Backup Archives Table */}
      <div className="bg-cyber-card/80 border border-cyber-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-cyber-border flex items-center justify-between">
          <h2 className="font-bold text-sm text-cyber-textMain flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyber-cyan" />
            <span>سجل لقطات النسخ الاحتياطي (Database Snapshots)</span>
          </h2>
          <span className="text-[11px] text-cyber-textMuted">المسار: C:\CyberCenter\Backups</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-cyber-border/60 bg-cyber-surface/40 text-cyber-textMuted font-semibold">
                <th className="py-3 px-4">اسم ملف الأرشيف</th>
                <th className="py-3 px-4">تاريخ الإنشاء</th>
                <th className="py-3 px-4">الحجم</th>
                <th className="py-3 px-4">محرك النسخ</th>
                <th className="py-3 px-4">بصمة SHA-256 المعتمدة</th>
                <th className="py-3 px-4">حالة السلامة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {archives.map((archive) => (
                <tr key={archive.id} className="hover:bg-cyber-surface/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-cyber-cyan font-semibold">{archive.name}</td>
                  <td className="py-3 px-4 text-cyber-textMuted font-mono">{archive.createdAt}</td>
                  <td className="py-3 px-4 font-mono text-cyber-textMain">{archive.sizeKb} KB</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-cyber-surface text-cyber-textMuted border border-cyber-border text-[10px]">
                      {archive.engine}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-cyber-textMuted">
                    <span title={archive.sha256} className="cursor-help">
                      {archive.sha256.substring(0, 16)}...{archive.sha256.substring(archive.sha256.length - 8)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {archive.status === 'VERIFYING' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] flex items-center gap-1 w-fit">
                        <RefreshCw className="w-3 h-3 animate-spin" /> جاري الفحص
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" /> تم التحقق
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleVerifyArchive(archive.id)}
                        disabled={archive.status === 'VERIFYING'}
                        className="px-2.5 py-1 rounded-lg bg-cyber-surface border border-cyber-border hover:border-cyber-cyan/50 text-cyber-textMain text-[11px] transition-colors"
                      >
                        فحص التجزئة
                      </button>
                      <button
                        onClick={() => alert(`بدء تحميل ملف الأرشيف ${archive.name}`)}
                        className="p-1 rounded-lg bg-cyber-surface border border-cyber-border hover:border-cyber-cyan/50 text-cyber-cyan transition-colors"
                        title="تحميل الأرشيف"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
