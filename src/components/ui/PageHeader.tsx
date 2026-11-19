import * as React from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  className,
}) => {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg', className)}>
      <div className="flex flex-col gap-1 text-right">
        <div className="flex items-center gap-space-sm flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-on-surface-variant font-normal">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-space-sm flex-wrap self-start md:self-auto">{actions}</div>}
    </div>
  );
};

export type DateRangePreset = 'today' | '7days' | '30days' | 'custom';

export interface DateRangeControlProps {
  selected: DateRangePreset;
  onSelect: (preset: DateRangePreset) => void;
  className?: string;
}

export const DateRangeControl: React.FC<DateRangeControlProps> = ({
  selected,
  onSelect,
  className,
}) => {
  const options: Array<{ id: DateRangePreset; label: string; icon?: string }> = [
    { id: 'today', label: 'اليوم' },
    { id: '7days', label: 'آخر 7 أيام' },
    { id: '30days', label: 'آخر 30 يوماً' },
    { id: 'custom', label: 'فترة مخصصة...', icon: 'calendar_month' },
  ];

  return (
    <div className={cn('inline-flex items-center bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-1 shadow-sm gap-1', className)}>
      {options.map((option) => {
        const isActive = selected === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 select-none focus:outline-none focus:ring-1 focus:ring-secondary',
              isActive
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            )}
          >
            {option.icon && (
              <span className="material-symbols-outlined text-[15px] leading-none">
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
