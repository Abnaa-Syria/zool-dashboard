import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string; // Material Symbol name
  iconPosition?: 'start' | 'end';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      icon,
      iconPosition = 'start',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-primary-container text-on-primary hover:bg-primary focus:ring-primary shadow-sm active:translate-y-[1px]',
      secondary:
        'bg-secondary text-on-secondary hover:bg-secondary-fixed-variant focus:ring-secondary shadow-sm active:translate-y-[1px]',
      outline:
        'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container hover:text-secondary focus:ring-secondary active:translate-y-[1px]',
      ghost:
        'bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus:ring-secondary',
      danger:
        'bg-error text-on-error hover:bg-error-container hover:text-on-error-container focus:ring-error shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-2.5 text-xs rounded-md gap-1.5',
      md: 'h-10 px-4 text-sm rounded-lg gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : icon && iconPosition === 'start' ? (
          <span className="material-symbols-outlined text-[18px] leading-none">{icon}</span>
        ) : null}

        {children}

        {!isLoading && icon && iconPosition === 'end' ? (
          <span className="material-symbols-outlined text-[18px] leading-none">{icon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string; // Accessible label for screen readers
  variant?: 'outline' | 'ghost' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, label, variant = 'outline', size = 'md', disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      outline:
        'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container shadow-sm',
      ghost:
        'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high',
      primary:
        'bg-primary-container text-on-primary hover:bg-primary shadow-sm',
      secondary:
        'bg-secondary text-on-secondary hover:bg-secondary-fixed-variant shadow-sm',
    };

    const sizes = {
      sm: 'w-8 h-8 text-[18px]',
      md: 'w-10 h-10 text-[20px]',
      lg: 'w-12 h-12 text-[24px]',
    };

    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="material-symbols-outlined text-inherit leading-none">{icon}</span>
        <span className="sr-only">{label}</span>
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
