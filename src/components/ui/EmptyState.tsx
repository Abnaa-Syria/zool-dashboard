import * as React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'event_busy',
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-space-xl flex flex-col items-center justify-center text-center my-space-md shadow-card',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-secondary mb-space-md shadow-sm">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-on-surface mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-on-surface-variant max-w-md mb-space-lg leading-relaxed">
          {description}
        </p>
      )}
      {(actionText || secondaryActionText) && (
        <div className="flex items-center gap-space-sm flex-wrap justify-center">
          {actionText && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionText}
            </Button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  diagnosticCode?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'تعذّر تحميل البيانات التشغيلية',
  message = 'حدث خطأ أثناء الاتصال بمزود البيانات أو انتهت مهلة الاستجابة. يرجى المحاولة مرة أخرى.',
  diagnosticCode,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-error-container/30 border border-error/30 rounded-xl p-space-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-card my-space-md text-right',
        className
      )}
    >
      <div className="flex items-start gap-space-md">
        <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[24px]">error</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-on-error-container">{title}</span>
          <span className="text-xs text-on-surface-variant mt-0.5">{message}</span>
          {diagnosticCode && (
            <span className="text-[11px] font-mono text-error font-medium mt-1">
              رمز التشخيص: {diagnosticCode}
            </span>
          )}
        </div>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon="refresh"
          onClick={onRetry}
          className="border-error/40 text-error hover:bg-error-container/50 shrink-0 self-end sm:self-auto"
        >
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
};
