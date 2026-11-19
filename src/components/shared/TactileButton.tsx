import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  depth?: 'shallow' | 'deep';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
}

export const TactileButton = React.forwardRef<HTMLButtonElement, TactileButtonProps>(
  ({ depth = 'shallow', size = 'sm', href, className, children, onClick, ...props }, ref) => {
    const depthClasses =
      depth === 'shallow'
        ? 'shadow-[0_2px_0_#09090b] active:shadow-none active:translate-y-[2px]'
        : 'shadow-[0_4px_0_#09090b] active:shadow-none active:translate-y-[4px]';

    const sizeClasses =
      size === 'sm'
        ? 'px-2.5 py-1 text-xs gap-1.5'
        : size === 'lg'
        ? 'px-5 py-2.5 text-base gap-2.5'
        : 'px-3.5 py-1.5 text-sm gap-2';

    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium rounded-lg',
      'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white',
      'border border-zinc-700/80 transition-all duration-75 select-none cursor-pointer',
      depthClasses,
      sizeClasses,
      className,
    );

    if (href) {
      return (
        <a href={href} className={baseClasses}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} type="button" onClick={onClick} className={baseClasses} {...props}>
        {children}
      </button>
    );
  },
);

TactileButton.displayName = 'TactileButton';
