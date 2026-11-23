import * as React from 'react';
import { cn } from '../../lib/utils';

/** Label/value pair used on entity detail pages. */
export const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
  <div className={cn('flex flex-col gap-0.5 min-w-0', className)}>
    <dt className="text-xs text-on-surface-variant">{label}</dt>
    <dd className="text-sm text-on-surface break-words">{children ?? '—'}</dd>
  </div>
);

/** Responsive grid of `Field`s. */
export const FieldGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <dl className={cn('grid grid-cols-2 md:grid-cols-4 gap-space-md', className)}>{children}</dl>
);

/** Monospace LTR value (ids, codes, phones). */
export const Mono: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span dir="ltr" className="font-mono text-xs">
    {children}
  </span>
);

/** Explains why a record has no delete button and which safe action replaces it. */
export const NotDeletableNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start gap-2 rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
    <span className="material-symbols-outlined text-[16px]">info</span>
    <span>{children}</span>
  </div>
);
