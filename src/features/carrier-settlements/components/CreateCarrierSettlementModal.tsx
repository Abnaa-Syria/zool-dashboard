import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { lastDays, sudanDate } from '../../../lib/dates';
import type { CarrierListItem } from '../../carriers/api';
import { carrierSettlementErrorMessage, useCreateCarrierSettlement, useStatementPreview, type CarrierSettlement } from '../api';
import { totalsFromPreview } from '../breakdown';
import { CarrierSelect } from './CarrierSelect';
import { NetBreakdownCard, StatementLinesTable } from './StatementView';

/** Last allowed day (yesterday in Sudan) and a default 7-day period ending on it. */
function endedPeriodDefaults(): { yesterday: string; initial: { from: string; to: string } } {
  const y = new Date(Date.now() - 86_400_000);
  return { yesterday: sudanDate(y), initial: lastDays(7, y) };
}

/**
 * Preview the live statement for a carrier + ended Sudan-day period, then save it as a DRAFT
 * (POST /admin/carrier-settlements). Figures are recomputed by the backend on creation.
 */
export const CreateCarrierSettlementModal: React.FC<{
  carriers: CarrierListItem[] | undefined;
  initialCompanyId?: string;
  onClose: () => void;
  onCreated: (s: CarrierSettlement) => void;
}> = ({ carriers, initialCompanyId, onClose, onCreated }) => {
  const [{ yesterday, initial }] = React.useState(endedPeriodDefaults);
  const [companyId, setCompanyId] = React.useState(initialCompanyId ?? '');
  const [from, setFrom] = React.useState(initial.from);
  const [to, setTo] = React.useState(initial.to);
  const [notes, setNotes] = React.useState('');
  const [previewFor, setPreviewFor] = React.useState<{ companyId: string; from: string; to: string } | null>(null);
  const preview = useStatementPreview(previewFor);
  const create = useCreateCarrierSettlement();

  const invalidRange = !from || !to || from > to;
  const notEnded = Boolean(to) && to > yesterday;
  const canPreview = Boolean(companyId) && !invalidRange;
  // The preview must match the current inputs before a draft can be saved.
  const previewCurrent = previewFor?.companyId === companyId && previewFor.from === from && previewFor.to === to;
  const canCreate = canPreview && !notEnded && previewCurrent && preview.isSuccess;

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent size="xl" className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>كشف تسوية جديد لشركة نقل</ModalTitle>
          <ModalDescription>
            يشمل الكشف الرحلات غير الملغاة التي انطلقت خلال الفترة (أيام بتوقيت السودان، شاملة). عاين الأرقام أولًا ثم احفظها كمسودة.
          </ModalDescription>
        </ModalHeader>
        <form
          className="flex flex-col gap-space-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canCreate) return;
            create.mutate({ companyId, fromDate: from, toDate: to, notes: notes.trim() || undefined }, { onSuccess: onCreated });
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm items-end">
            <label className="flex flex-col gap-1 text-sm">
              الشركة
              <CarrierSelect carriers={carriers} value={companyId} onChange={setCompanyId} allLabel="اختر الشركة..." />
            </label>
            <Input label="من يوم" type="date" value={from} max={to || yesterday} onChange={(e) => setFrom(e.target.value)} required />
            <Input label="إلى يوم (شامل)" type="date" value={to} min={from} max={yesterday} onChange={(e) => setTo(e.target.value)} required />
          </div>
          {invalidRange && <p className="text-xs text-error">تاريخ البداية يجب أن يسبق تاريخ النهاية أو يساويه.</p>}
          {notEnded && <p className="text-xs text-error">لا يُنشأ كشف إلا لفترة انتهت: آخر يوم مسموح هو {yesterday}.</p>}
          <div>
            <Button
              type="button"
              variant="outline"
              icon="preview"
              disabled={!canPreview}
              isLoading={preview.isFetching}
              onClick={() => (previewCurrent ? preview.refetch() : setPreviewFor({ companyId, from, to }))}
            >
              معاينة الكشف
            </Button>
          </div>

          {previewFor && !previewCurrent && <p className="text-xs text-on-surface-variant">تغيّرت المدخلات — أعد المعاينة قبل الحفظ.</p>}
          {previewFor && previewCurrent && (
            preview.isLoading ? (
              <Skeleton className="h-48 rounded-lg" />
            ) : preview.isError ? (
              <ErrorState title="تعذّرت المعاينة" message={carrierSettlementErrorMessage(preview.error)} onRetry={() => preview.refetch()} />
            ) : preview.data ? (
              <div className="space-y-space-sm">
                <NetBreakdownCard totals={totalsFromPreview(preview.data)} />
                <details className="rounded-lg border border-surface-container-high p-2">
                  <summary className="cursor-pointer text-sm font-semibold">تفاصيل الرحلات ({preview.data.lines.length})</summary>
                  <div className="mt-2">
                    <StatementLinesTable lines={preview.data.lines} carrierBearsCommission={preview.data.config.commissionBearer === 'CARRIER'} />
                  </div>
                </details>
              </div>
            ) : null
          )}

          <label className="flex flex-col gap-1 text-sm">
            ملاحظات (اختياري)
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} rows={2} className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-2 text-sm" />
          </label>
          {create.isError && <p className="text-xs text-error">{carrierSettlementErrorMessage(create.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" isLoading={create.isPending} disabled={!canCreate}>حفظ كمسودة</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
