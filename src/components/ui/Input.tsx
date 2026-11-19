import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  startIcon?: string;
  endIcon?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, startIcon, endIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-1 w-full text-right">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-on-surface">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <span className="material-symbols-outlined absolute right-3 pointer-events-none text-on-surface-variant text-[18px]">
              {startIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-10 rounded-lg bg-surface-container-lowest text-on-surface text-sm border border-outline-variant/60 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all',
              startIcon ? 'pr-9 pl-3' : 'px-3',
              endIcon ? 'pl-9' : '',
              error ? 'border-error focus:ring-error/20' : '',
              className
            )}
            {...props}
          />
          {endIcon && (
            <span className="material-symbols-outlined absolute left-3 pointer-events-none text-on-surface-variant text-[18px]">
              {endIcon}
            </span>
          )}
        </div>
        {error && <span className="text-xs text-error font-medium">{error}</span>}
        {hint && !error && <span className="text-xs text-on-surface-variant">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  scopeLabel?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, scopeLabel, placeholder = 'بحث سريع...', ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <span className="material-symbols-outlined absolute right-3 pointer-events-none text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            'w-full h-10 pr-10 pl-8 rounded-lg bg-surface-container-lowest text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/30 border border-outline-variant/40 transition-all shadow-sm',
            className
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute left-2.5 p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="مسح البحث"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
        {scopeLabel && !value && (
          <span className="absolute left-3 text-[11px] text-outline font-medium pointer-events-none hidden sm:inline-block">
            {scopeLabel}
          </span>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
