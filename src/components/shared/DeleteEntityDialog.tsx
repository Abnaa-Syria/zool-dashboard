import * as React from 'react';
import { Button } from '../ui/Button';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../ui/Modal';
import { parseEntityInUse, usageLines, type EntityInUse } from '../../lib/api/entityInUse';
import { errorMessage } from '../../lib/api/errors';

/** Safe alternative offered when the record is in use (deactivate / retire / suspend). */
export type SafeAlternative = {
  /** Button text, e.g. "إلغاء تفعيل المدينة". */
  label: string;
  /** What the alternative does, in Arabic. */
  description: string;
  run: () => Promise<unknown>;
};

export interface DeleteEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Kind of record with the definite article, e.g. "المدينة". */
  entityLabel: string;
  /** Record name shown in the title. */
  name: string;
  /** Extra consequences of deleting (optional). */
  description?: React.ReactNode;
  confirmText?: string;
  onDelete: () => Promise<unknown>;
  /** Called after a successful delete (e.g. navigate back to the list). */
  onDeleted?: () => void;
  /** Offered when the API answers 409 ENTITY_IN_USE. Omit when it does not apply (e.g. already inactive). */
  alternative?: SafeAlternative;
  /** Called after the alternative succeeded. */
  onAlternativeDone?: () => void;
}

/**
 * Confirms a hard delete naming the record. On 409 ENTITY_IN_USE it switches to an explanation of what
 * still uses the record and offers the safe alternative in place.
 */
export const DeleteEntityDialog: React.FC<DeleteEntityDialogProps> = ({
  open,
  onOpenChange,
  entityLabel,
  name,
  description,
  confirmText = 'حذف نهائي',
  onDelete,
  onDeleted,
  alternative,
  onAlternativeDone,
}) => {
  const [pending, setPending] = React.useState<'delete' | 'alternative' | null>(null);
  const [error, setError] = React.useState<unknown>(null);
  const [inUse, setInUse] = React.useState<EntityInUse | null>(null);

  /** Every close goes through here, so the next open starts clean. */
  const close = () => {
    setError(null);
    setInUse(null);
    onOpenChange(false);
  };

  const runDelete = async () => {
    setPending('delete');
    setError(null);
    try {
      await onDelete();
      close();
      onDeleted?.();
    } catch (e) {
      const parsed = parseEntityInUse(e);
      if (parsed) setInUse(parsed);
      else setError(e);
    } finally {
      setPending(null);
    }
  };

  const runAlternative = async () => {
    if (!alternative) return;
    setPending('alternative');
    setError(null);
    try {
      await alternative.run();
      close();
      onAlternativeDone?.();
    } catch (e) {
      setError(e);
    } finally {
      setPending(null);
    }
  };

  const lines = inUse ? usageLines(inUse.usage) : [];

  return (
    <Modal open={open} onOpenChange={(o) => (pending || o ? undefined : close())}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{inUse ? `لا يمكن حذف ${entityLabel} «${name}»` : `حذف ${entityLabel} «${name}»؟`}</ModalTitle>
          <ModalDescription asChild>
            <div className="text-sm text-on-surface-variant leading-relaxed space-y-2">
              {inUse ? (
                <>
                  <p>ما زال هذا السجل مستخدمًا في بيانات لا يجوز فقدانها (سجل تشغيلي ومالي):</p>
                  {lines.length > 0 ? (
                    <ul className="list-disc pr-5 space-y-0.5 text-on-surface" data-testid="usage-list">
                      {lines.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  ) : null}
                  {alternative ? (
                    <p>
                      <strong className="text-on-surface">البديل الآمن:</strong> {alternative.description}
                    </p>
                  ) : (
                    <p>أزل هذه الارتباطات أولًا ثم أعد المحاولة.</p>
                  )}
                </>
              ) : (
                <>
                  <p>سيُحذف السجل نهائيًا ولا يمكن التراجع. يُسمح بالحذف فقط إذا لم يكن مستخدمًا في أي بيانات أخرى.</p>
                  {description}
                </>
              )}
            </div>
          </ModalDescription>
        </ModalHeader>
        {error ? (
          <p role="alert" className="text-xs text-error">
            {errorMessage(error)}
          </p>
        ) : null}
        <ModalFooter>
          <Button type="button" variant="outline" disabled={pending !== null} onClick={close}>
            {inUse ? 'إغلاق' : 'إلغاء'}
          </Button>
          {inUse ? (
            alternative ? (
              <Button type="button" variant="primary" isLoading={pending === 'alternative'} onClick={runAlternative}>
                {alternative.label}
              </Button>
            ) : null
          ) : (
            <Button type="button" variant="danger" icon="delete" isLoading={pending === 'delete'} onClick={runDelete}>
              {confirmText}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
