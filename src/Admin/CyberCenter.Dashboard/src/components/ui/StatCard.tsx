import React from 'react';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'violet' | 'crimson';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'cyan',
}) => {
  const accentClasses = {
    cyan: 'text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/20 group-hover:border-cyber-cyan/50',
    emerald: 'text-cyber-emerald bg-cyber-emerald/10 border-cyber-emerald/20 group-hover:border-cyber-emerald/50',
    amber: 'text-cyber-gold bg-cyber-gold/10 border-cyber-gold/20 group-hover:border-cyber-gold/50',
    violet: 'text-cyber-violet bg-cyber-violet/10 border-cyber-violet/20 group-hover:border-cyber-violet/50',
    crimson: 'text-cyber-crimson bg-cyber-crimson/10 border-cyber-crimson/20 group-hover:border-cyber-crimson/50',
  };

  return (
    <div className="group relative bg-cyber-card/80 backdrop-blur-sm border border-cyber-border/80 rounded-xl p-5 hover:border-cyber-borderLight transition-all duration-300 hover:shadow-lg hover:shadow-black/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-cyber-textMuted mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-cyber-textMain">{value}</h3>
          {subtitle && (
            <p className="text-xs text-cyber-textDark mt-1 font-mono">{subtitle}</p>
          )}
        </div>
        <div className={clsx('p-3 rounded-lg border transition-all duration-300', accentClasses[accentColor])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-cyber-border/40 flex items-center justify-between text-xs">
          <span className={clsx('font-medium inline-flex items-center gap-1', trend.isPositive ? 'text-emerald-400' : 'text-rose-400')}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-cyber-textDark">مقارنة بأمس</span>
        </div>
      )}
    </div>
  );
};

