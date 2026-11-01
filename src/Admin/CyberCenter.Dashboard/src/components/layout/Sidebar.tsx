import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  MonitorPlay,
  History,
  Users,
  CreditCard,
  ShoppingBag,
  ChefHat,
  Wallet,
  Receipt,
  BarChart3,
  CalendarCheck2,
  Activity,
  Zap,
  UserCog,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Database,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { t } = useTranslation();

  const navGroups = [
    {
      title: 'العمليات الأساسية',
      items: [
        { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
        { to: '/devices', icon: MonitorPlay, label: t('nav.liveDevices') },
        { to: '/sessions', icon: History, label: t('nav.sessions') },
      ],
    },
    {
      title: 'المستخدمون والاشتراكات',
      items: [
        { to: '/members', icon: Users, label: t('nav.members') },
        { to: '/cards', icon: CreditCard, label: t('nav.temporaryCards') },
      ],
    },
    {
      title: 'المبيعات والضيافة',
      items: [
        { to: '/store', icon: ShoppingBag, label: t('nav.store') },
        { to: '/kitchen', icon: ChefHat, label: t('nav.kitchen') },
      ],
    },
    {
      title: 'المحاسبة والتقارير',
      items: [
        { to: '/payments', icon: Wallet, label: t('nav.payments') },
        { to: '/expenses', icon: Receipt, label: t('nav.expenses') },
        { to: '/reports', icon: BarChart3, label: t('nav.financialReports') },
        { to: '/closing', icon: CalendarCheck2, label: t('nav.monthlyClosing') },
      ],
    },
    {
      title: 'الشبكة والمنظومة',
      items: [
        { to: '/network', icon: Activity, label: t('nav.networkMonitoring') },
        { to: '/energy', icon: Zap, label: t('nav.energyMonitoring') },
        { to: '/employees', icon: UserCog, label: t('nav.employees') },
        { to: '/audit', icon: FileSpreadsheet, label: t('nav.auditLogs') },
        { to: '/settings', icon: Settings, label: t('nav.systemSettings') },
        { to: '/backup', icon: Database, label: t('nav.backupRestore') },
      ],
    },
  ];

  return (
    <aside
      className={clsx(
        'h-screen sticky top-0 bg-cyber-deep/95 backdrop-blur-md border-e border-cyber-border/80 flex flex-col z-30 transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-cyber-border/60 gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 flex items-center justify-center shadow-glow-cyan">
          <ShieldCheck className="w-6 h-6 text-black stroke-[2.5]" />
        </div>
        {!collapsed && (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-wide text-cyber-textMain">CYBER</span>
              <span className="font-extrabold text-lg text-cyber-cyan">CENTER</span>
            </div>
            <p className="text-[10px] text-cyber-textDark uppercase tracking-wider font-mono">Fleet Control v1.0</p>
          </div>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <p className="text-[11px] font-semibold text-cyber-textDark px-3 py-1 uppercase tracking-wider">
                {group.title}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-cyber-cyan/15 text-cyber-cyan shadow-sm border border-cyber-cyan/30'
                      : 'text-cyber-textMuted hover:text-cyber-textMain hover:bg-cyber-card/60'
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-cyber-border/60">
        <div className="bg-cyber-card/50 rounded-lg p-2.5 flex items-center justify-between text-xs text-cyber-textMuted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {!collapsed && <span>الخادم نشط 100%</span>}
          </div>
          {!collapsed && <span className="font-mono text-[10px] text-cyber-textDark">v1.0.0</span>}
        </div>
      </div>
    </aside>
  );
};

