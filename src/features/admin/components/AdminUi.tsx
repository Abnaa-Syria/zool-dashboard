import * as React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import type { PageMeta } from '../../../lib/api/client';

export const AdminStatusBadge: React.FC<{ status: string }> = ({ status }) =>
  status === 'ACTIVE' ? (
    <Badge variant="success" dot>نشط</Badge>
  ) : status === 'SUSPENDED' ? (
    <Badge variant="error" dot>موقوف</Badge>
  ) : (
    <Badge variant="neutral">{status}</Badge>
  );

export const Pager: React.FC<{ meta?: PageMeta; onPage: (page: number) => void; disabled?: boolean }> = ({ meta, onPage, disabled }) => {
  if (!meta) return null;
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-on-surface-variant">
      <span>
        صفحة {meta.page} من {meta.totalPages} — الإجمالي {meta.total.toLocaleString('en-US')}
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" icon="chevron_right" disabled={disabled || meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
          السابق
        </Button>
        <Button size="sm" variant="outline" icon="chevron_left" iconPosition="end" disabled={disabled || meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>
          التالي
        </Button>
      </div>
    </div>
  );
};

export const InlineError: React.FC<{ message: string | null | undefined }> = ({ message }) =>
  message ? (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-error/30 bg-error-container/30 px-3 py-2 text-xs text-on-error-container">
      <span className="material-symbols-outlined text-[16px] text-error">error</span>
      <span>{message}</span>
    </div>
  ) : null;

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmText: string;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: string | null;
  danger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, onOpenChange, title, description, confirmText, onConfirm, isLoading, error, danger }) => (
  <Modal open={open} onOpenChange={onOpenChange}>
    <ModalContent size="sm">
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription asChild>
          <div className="text-sm text-on-surface-variant leading-relaxed">{description}</div>
        </ModalDescription>
      </ModalHeader>
      <InlineError message={error} />
      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
          إلغاء
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export const Section: React.FC<{ title: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, actions, children, className }) => (
  <section className={`bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm ${className ?? ''}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-bold text-on-surface">{title}</h2>
      {actions}
    </div>
    {children}
  </section>
);
