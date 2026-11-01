import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GenericPageProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  children?: React.ReactNode;
}

export const GenericPage: React.FC<GenericPageProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge = 'نشط',
  children,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-cyber-textMain flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-cyan">
              <Icon className="w-5 h-5" />
            </div>
            <span>{title}</span>
            {badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
                {badge}
              </span>
            )}
          </h1>
          <p className="text-xs text-cyber-textMuted mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Main Body Content */}
      {children ? (
        children
      ) : (
        <div className="bg-cyber-card/60 border border-cyber-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyber-deep border border-cyber-border flex items-center justify-center text-cyber-cyan">
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-cyber-textMain mb-1">{title}</h3>
          <p className="text-xs text-cyber-textMuted max-w-md mx-auto mb-6">
            تم إعداد بنية الوحدة وهي جاهزة للربط مع خادم API وقاعدة بيانات PostgreSQL المركزية.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-deep border border-cyber-border text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Endpoint: /api/v1/{title.toLowerCase().replace(/\s+/g, '-')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

