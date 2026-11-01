import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export type DeviceStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Offline' | 'Locked' | 'Error';

interface StatusBadgeProps {
  status: DeviceStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useTranslation();

  const statusConfig: Record<DeviceStatus, { bg: string; text: string; dot: string; glow: string }> = {
    Available: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      glow: 'shadow-glow-emerald',
    },
    Occupied: {
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      text: 'text-cyan-400',
      dot: 'bg-cyan-400',
      glow: 'shadow-glow-cyan',
    },
    Reserved: {
      bg: 'bg-purple-500/10 border-purple-500/30',
      text: 'text-purple-400',
      dot: 'bg-purple-400',
      glow: '',
    },
    Maintenance: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      glow: 'shadow-glow-gold',
    },
    Offline: {
      bg: 'bg-slate-700/20 border-slate-700/40',
      text: 'text-slate-400',
      dot: 'bg-slate-500',
      glow: '',
    },
    Locked: {
      bg: 'bg-rose-500/10 border-rose-500/30',
      text: 'text-rose-400',
      dot: 'bg-rose-400',
      glow: 'shadow-glow-crimson',
    },
    Error: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-400',
      dot: 'bg-red-400',
      glow: 'shadow-glow-crimson',
    },
  };

  const current = statusConfig[status] || statusConfig.Offline;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium border rounded-full transition-all duration-200',
        current.bg,
        current.text,
        current.glow,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', current.dot)} />
      {t(`status.${status}`)}
    </span>
  );
};

