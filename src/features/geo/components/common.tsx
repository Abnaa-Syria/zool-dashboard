import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import type { PageMeta } from '../../../lib/api/client';
import { errorMessage } from '../../../lib/api/errors';
import { cn } from '../../../lib/utils';

/** Shared bits for the network (geo) and fleet pages. */

export const SELECT_CLASS = 'h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const generated = React.useId();
  const selectId = id ?? generated;
  const control = <select id={selectId} className={cn(SELECT_CLASS, error && 'border-error', label && 'w-full', className)} {...props} />;
  if (!label) return control;
  return (
    <div className="flex flex-col gap-1 w-full text-right">
      <label htmlFor={selectId} className="text-xs font-semibold text-on-surface">{label}</label>
      {control}
      {error && <span className="text-xs text-error font-medium">{error}</span>}
    </div>
  );
};

/** Server pagination footer (meta from the API envelope). Hidden for a single page. */
export const Pager: React.FC<{ meta: PageMeta | undefined; busy?: boolean; onPage: (page: number) => void }> = ({ meta, busy, onPage }) => {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-space-sm mt-space-sm border-t border-surface-container text-xs text-on-surface-variant">
      <span>
        صفحة {meta.page} من {meta.totalPages} · {meta.total.toLocaleString('en-US')} سجل
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={meta.page <= 1 || busy} onClick={() => onPage(meta.page - 1)}>السابق</Button>
        <Button size="sm" variant="outline" disabled={meta.page >= meta.totalPages || busy} onClick={() => onPage(meta.page + 1)}>التالي</Button>
      </div>
    </div>
  );
};

/** Yes/no confirmation that runs a mutation and stays open (with the error) when it fails. */
export const ConfirmDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  confirmText: string;
  danger?: boolean;
  pending?: boolean;
  error?: unknown;
  onConfirm: () => void;
}> = ({ open, onOpenChange, title, children, confirmText, danger, pending, error, onConfirm }) => (
  <Modal open={open} onOpenChange={onOpenChange}>
    <ModalContent size="sm">
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription asChild>
          <div className="text-sm text-on-surface-variant leading-relaxed">{children}</div>
        </ModalDescription>
      </ModalHeader>
      {error ? <p className="text-xs text-error">{errorMessage(error)}</p> : null}
      <ModalFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
        <Button type="button" variant={danger ? 'danger' : 'primary'} isLoading={pending} onClick={onConfirm}>{confirmText}</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export const TableShell: React.FC<{ head: React.ReactNode; children: React.ReactNode }> = ({ head, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="text-on-surface-variant text-xs">
        <tr className="text-right">{head}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export const Th: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th className={cn('py-2 px-2 font-medium', className)}>{children}</th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('py-2 px-2', className)} {...props} />
);

export const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <section className={cn('bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md', className)}>{children}</section>
);

/** Material Symbols icon (the dashboard loads the font globally). */
export const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <span className={cn('material-symbols-outlined leading-none', className)} aria-hidden>{name}</span>
);
