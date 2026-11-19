import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'mint' | 'outline' | 'flat';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'surface', children, ...props }, ref) => {
    const variants = {
      surface: 'bg-surface-container-lowest border border-outline-variant/40 shadow-card',
      mint: 'bg-surface-container-low border border-surface-container-high shadow-card',
      outline: 'bg-transparent border border-outline-variant/60',
      flat: 'bg-surface-container-low/60',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-xl p-space-md transition-shadow', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  icon: string;
  iconBg?: string;
  badge?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  trend,
  icon,
  iconBg = 'bg-surface-container-high text-secondary',
  badge,
  className,
  footer,
}) => {
  return (
    <Card className={cn('flex flex-col justify-between relative overflow-hidden group hover:shadow-hover', className)}>
      <div className="flex items-center justify-between gap-space-sm mb-space-sm">
        <div className="flex items-center gap-space-sm">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-bold', iconBg)}>
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-on-surface-variant leading-tight">{title}</span>
            {subValue && <span className="text-[11px] text-outline mt-0.5">{subValue}</span>}
          </div>
        </div>
        {badge}
      </div>

      <div className="my-space-xs flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-on-surface tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
              trend.isPositive ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'
            )}
          >
            <span className="material-symbols-outlined text-[14px]">
              {trend.isPositive ? 'trending_up' : 'trending_down'}
            </span>
            {trend.value}
          </span>
        )}
      </div>

      {footer && (
        <div className="mt-space-sm pt-space-xs border-t border-outline-variant/30 text-xs text-on-surface-variant">
          {footer}
        </div>
      )}
    </Card>
  );
};

export interface HeroBalanceCardProps {
  title: string;
  balance: string;
  currency?: string;
  secondaryStats?: Array<{
    label: string;
    value: string;
  }>;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  title,
  balance,
  currency = 'ج.س',
  secondaryStats = [],
  actionText,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-secondary text-on-secondary rounded-xl p-space-lg shadow-card relative overflow-hidden flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-center justify-between mb-space-md">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary-fixed text-[24px]">
            account_balance_wallet
          </span>
          <span className="text-sm font-medium text-secondary-fixed opacity-90">{title}</span>
        </div>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="text-xs font-semibold bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-on-secondary px-3 py-1.5 rounded-lg transition-colors"
          >
            {actionText}
          </button>
        )}
      </div>

      <div className="mb-space-md">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight tabular-nums text-white">{balance}</span>
          <span className="text-sm text-secondary-fixed font-semibold">{currency}</span>
        </div>
      </div>

      {secondaryStats.length > 0 && (
        <div className="pt-space-sm border-t border-white/10 grid grid-cols-2 gap-space-sm">
          {secondaryStats.map((stat, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[11px] text-secondary-fixed opacity-75">{stat.label}</span>
              <span className="text-sm font-semibold tabular-nums text-white">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
