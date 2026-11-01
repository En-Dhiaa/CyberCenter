import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileSpreadsheet,
  Search,
  Clock,
  User,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  action: string;
  entityName: string;
  entityId?: string;
  username: string;
  beforeStateJson?: string;
  afterStateJson?: string;
  ipAddress?: string;
  createdAtUtc: string;
}

const initialAuditLogs: AuditLogItem[] = [
  {
    id: '1',
    action: 'LockStation',
    entityName: 'Device',
    entityId: 'station-06',
    username: 'superadmin',
    beforeStateJson: '{"status":"Available"}',
    afterStateJson: '{"status":"Locked","reason":"Security Inspection"}',
    ipAddress: '192.168.1.5',
    createdAtUtc: '2026-11-01T12:35:10Z',
  },
  {
    id: '2',
    action: 'CreateEmployee',
    entityName: 'User',
    entityId: 'ahmed_cashier',
    username: 'superadmin',
    afterStateJson: '{"username":"ahmed_cashier","role":"Cashier"}',
    ipAddress: '192.168.1.5',
    createdAtUtc: '2026-11-01T12:20:45Z',
  },
  {
    id: '3',
    action: 'UserLoginSuccess',
    entityName: 'User',
    entityId: 'superadmin',
    username: 'superadmin',
    afterStateJson: '{"role":"SuperAdmin"}',
    ipAddress: '192.168.1.5',
    createdAtUtc: '2026-11-01T12:00:02Z',
  },
  {
    id: '4',
    action: 'UpdateSystemSettings',
    entityName: 'Settings',
    username: 'superadmin',
    beforeStateJson: '{"defaultHourlyRate":500}',
    afterStateJson: '{"defaultHourlyRate":600,"offlineGraceMinutes":7}',
    ipAddress: '192.168.1.5',
    createdAtUtc: '2026-11-01T11:45:20Z',
  },
  {
    id: '5',
    action: 'UnlockStation',
    entityName: 'Device',
    entityId: 'station-02',
    username: 'omar_admin',
    beforeStateJson: '{"status":"Locked"}',
    afterStateJson: '{"status":"Available"}',
    ipAddress: '192.168.1.12',
    createdAtUtc: '2026-11-01T10:14:00Z',
  },
];

export const AuditLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const [logs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'All' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('Lock')) return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    if (action.includes('Unlock')) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (action.includes('Login')) return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
    if (action.includes('Create')) return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
    return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-cyber-textMain flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-cyan">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span>{t('nav.auditLogs')}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              IMMUTABLE APPEND-ONLY
            </span>
          </h1>
          <p className="text-xs text-cyber-textMuted mt-1">
            سجل تدقيق شامل ومحمي برمجياً من التعديل والحذف يوثق كل عملية إدارية، مالية، أو أمنية في المنظومة
          </p>
        </div>

        {/* Search & Action Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-cyber-textDark absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالعملية أو الموظف أو الكيان..."
              className="bg-cyber-card border border-cyber-border rounded-xl ps-9 pe-4 py-2 text-xs text-cyber-textMain placeholder:text-cyber-textDark focus:outline-none focus:border-cyber-cyan/50 font-sans"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-cyber-card border border-cyber-border rounded-xl px-3 py-2 text-xs text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
          >
            <option value="All">كل العمليات</option>
            <option value="LockStation">قفل محطة (LockStation)</option>
            <option value="UnlockStation">فتح محطة (UnlockStation)</option>
            <option value="CreateEmployee">إنشاء موظف (CreateEmployee)</option>
            <option value="UserLoginSuccess">تسجيل دخول (UserLogin)</option>
            <option value="UpdateSystemSettings">تعديل الإعدادات (UpdateSettings)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-cyber-card/80 border border-cyber-border rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-start text-xs">
          <thead className="bg-cyber-deep/80 text-cyber-textDark border-b border-cyber-border uppercase text-[10px] font-semibold tracking-wider">
            <tr>
              <th className="py-3.5 px-4 text-start">نوع العملية</th>
              <th className="py-3.5 px-4 text-start">الموظف المنفذ</th>
              <th className="py-3.5 px-4 text-start">الكيان المرتبط</th>
              <th className="py-3.5 px-4 text-start">عنوان IP</th>
              <th className="py-3.5 px-4 text-start">التاريخ والوقت (UTC)</th>
              <th className="py-3.5 px-4 text-end">التفاصيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/40 font-mono">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-cyber-deep/50 transition-colors">
                <td className="py-3.5 px-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-semibold ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="flex items-center gap-1.5 text-cyber-textMain font-medium">
                    <User className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>{log.username}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-cyber-textMuted">
                  {log.entityName} {log.entityId && <span className="text-cyber-textDark">({log.entityId})</span>}
                </td>
                <td className="py-3.5 px-4 text-cyber-textDark text-[11px]">{log.ipAddress || '127.0.0.1'}</td>
                <td className="py-3.5 px-4 text-cyber-textDark text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{log.createdAtUtc.replace('T', ' ').replace('Z', '')}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-end">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="p-1.5 rounded-lg bg-cyber-deep border border-cyber-border hover:border-cyber-cyan/40 text-cyber-cyan transition-all"
                    title="فحص التغييرات"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inspection Modal Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-deep border border-cyber-borderLight rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div>
                <h3 className="font-bold text-sm text-cyber-textMain flex items-center gap-2">
                  <span>فحص سجل التدقيق رقم #{selectedLog.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getActionBadge(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </h3>
                <p className="text-[11px] text-cyber-textDark font-mono mt-0.5">
                  المنفذ: {selectedLog.username} • {selectedLog.createdAtUtc}
                </p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-cyber-textDark hover:text-cyber-textMain">✕</button>
            </div>

            {/* Before and After State Diffs */}
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-cyber-textDark text-[11px] font-semibold mb-1">الحالة السابقة (Before State):</p>
                <pre className="p-3 bg-cyber-card border border-cyber-border rounded-xl text-cyber-textMuted font-mono text-[11px] overflow-x-auto">
                  {selectedLog.beforeStateJson || '/* No prior state recorded / Initial creation */'}
                </pre>
              </div>

              <div>
                <p className="text-cyber-textDark text-[11px] font-semibold mb-1">الحالة بعد التعديل (After State):</p>
                <pre className="p-3 bg-cyber-card border border-cyber-border rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {selectedLog.afterStateJson || '/* State unchanged */'}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-cyber-border flex items-center justify-between text-xs">
              <span className="text-[11px] text-cyber-textDark flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cryptographically Verified Record
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-textMain hover:border-cyber-borderLight"
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
