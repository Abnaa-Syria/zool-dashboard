import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const variants = {
    neutral: 'bg-surface-container text-on-surface-variant border border-outline-variant/30',
    success: 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]',
    warning: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
    error: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]',
    info: 'bg-surface-container-high text-secondary border border-surface-container-highest',
    primary: 'bg-primary-container text-on-primary',
    secondary: 'bg-secondary-container text-on-secondary-container',
  };

  const dotColors = {
    neutral: 'bg-outline',
    success: 'bg-[#15803D]',
    warning: 'bg-[#B45309]',
    error: 'bg-[#B91C1C]',
    info: 'bg-secondary',
    primary: 'bg-on-primary',
    secondary: 'bg-secondary',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'on_route';

export interface StatusBadgeProps {
  status: BookingStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case 'confirmed':
    case 'مؤكد':
      return (
        <Badge variant="success" dot className={className}>
          مؤكد
        </Badge>
      );
    case 'pending':
    case 'قيد الانتظار':
    case 'معلق':
      return (
        <Badge variant="warning" dot className={className}>
          قيد الانتظار
        </Badge>
      );
    case 'cancelled':
    case 'ملغى':
    case 'مسترد':
      return (
        <Badge variant="error" dot className={className}>
          ملغى
        </Badge>
      );
    case 'on_route':
    case 'على الطريق':
    case 'نشط':
      return (
        <Badge variant="secondary" dot className={className}>
          على الطريق
        </Badge>
      );
    case 'completed':
    case 'مكتمل':
    case 'وصل':
      return (
        <Badge variant="neutral" dot className={className}>
          مكتمل
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" className={className}>
          {status}
        </Badge>
      );
  }
};
