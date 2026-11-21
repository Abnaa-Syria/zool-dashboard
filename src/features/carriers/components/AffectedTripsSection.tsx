import * as React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ApiError } from '../../../lib/api/client';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { useAffectedTrips, useCancelTrip, type AffectedTrip, type CancelTripResult } from '../api';

/**
 * D-SUS-01 review list: future trips of the carrier that still carry confirmed bookings.
 * Rendered when the carrier is suspended or when the list is non-empty.
 */
export const AffectedTripsSection: React.FC<{ companyId: string; suspended: boolean }> = ({ companyId, suspended }) => {
  const { can } = useAuth();
  const canCancel = can('catalog.manage') && can('bookings.cancel');
  const [page, setPage] = React.useState(1);
  const trips = useAffectedTrips(companyId, page);
  const [target, setTarget] = React.useState<AffectedTrip | null>(null);
  const rows = trips.data?.data ?? [];
  const meta = trips.data?.meta;

  if (!suspended && !trips.isLoading && !trips.isError && (meta?.total ?? 0) === 0) return null;

  return (
    <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-on-surface">الرحلات المتأثرة</h2>
          <p className="text-xs text-on-surface-variant">
            رحلات قادمة عليها حجوزات مؤكدة. لا تُلغى تلقائيًا — قرّر لكل رحلة: إلغاء مع استرداد كامل (بدون رسوم) أو الإبقاء عليها.
          </p>
        </div>
        {meta && meta.total > 0 && <Badge variant="warning">{meta.total} رحلة</Badge>}
      </div>

      {trips.isLoading ? (
        <Skeleton className="h-32 rounded-lg" />
      ) : trips.isError ? (
        <ErrorState title="تعذّر تحميل الرحلات المتأثرة" message={errorMessage(trips.error)} onRetry={() => trips.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد رحلات متأثرة" description="لا توجد رحلات قادمة عليها حجوزات مؤكدة لهذه الشركة." icon="event_available" className="my-0 shadow-none" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-on-surface-variant text-xs">
              <tr className="text-right">
                <th className="py-2 px-2 font-medium">رقم الرحلة</th>
                <th className="py-2 px-2 font-medium">المسار</th>
                <th className="py-2 px-2 font-medium">المغادرة</th>
                <th className="py-2 px-2 font-medium">حجوزات مؤكدة</th>
                <th className="py-2 px-2 font-medium">تذاكر</th>
                <th className="py-2 px-2 font-medium">القيمة</th>
                {canCancel && <th className="py-2 px-2 font-medium" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.tripId} className="border-t border-surface-container">
                  <td className="py-2 px-2 font-mono text-xs" dir="ltr">{t.tripNumber ?? t.tripId.slice(-8).toUpperCase()}</td>
                  <td className="py-2 px-2">{t.origin} ← {t.destination}</td>
                  <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(t.departureAt)}</td>
                  <td className="py-2 px-2 tabular-nums">
                    {t.confirmedBookings}
                    <span className="text-[11px] text-on-surface-variant"> (وكلاء {t.byChannel.BROKER} · مباشر {t.byChannel.DIRECT})</span>
                  </td>
                  <td className="py-2 px-2 tabular-nums">{t.ticketCount}</td>
                  <td className="py-2 px-2 tabular-nums">{formatSdg(t.totalAmountMinor)}</td>
                  {canCancel && (
                    <td className="py-2 px-2 text-left">
                      <Button size="sm" variant="danger" onClick={() => setTarget(t)}>إلغاء مع استرداد كامل</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span>صفحة {meta.page} من {meta.totalPages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>السابق</Button>
            <Button size="sm" variant="outline" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>التالي</Button>
          </div>
        </div>
      )}

      {target && <CancelTripModal companyId={companyId} trip={target} onClose={() => setTarget(null)} />}
    </section>
  );
};

const CancelTripModal: React.FC<{ companyId: string; trip: AffectedTrip; onClose: () => void }> = ({ companyId, trip, onClose }) => {
  const cancel = useCancelTrip(companyId);
  const [reason, setReason] = React.useState('');
  const [result, setResult] = React.useState<CancelTripResult | null>(null);
  const valid = reason.trim().length >= 3;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    cancel.mutate({ tripId: trip.tripId, reason: reason.trim() }, { onSuccess: setResult });
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>إلغاء الرحلة {trip.tripNumber ?? ''}</ModalTitle>
          <ModalDescription>
            {trip.origin} ← {trip.destination} · {formatDateTime(trip.departureAt)}
          </ModalDescription>
        </ModalHeader>
        {result ? (
          <div className="space-y-2 text-sm">
            <p>
              أُلغيت الرحلة. تم استرداد <strong>{result.refundedBookings}</strong> حجز بقيمة{' '}
              <strong>{formatSdg(result.refundedAmountMinor)}</strong>.
            </p>
            {result.failed.length > 0 && (
              <div className="rounded-lg border border-error/30 bg-error-container/30 p-2 space-y-1">
                <p className="font-semibold text-error">تعذّر استرداد {result.failed.length} حجز — راجعها من صفحة الحجوزات:</p>
                <ul className="text-xs space-y-0.5">
                  {result.failed.map((f) => (
                    <li key={f.bookingId}>
                      <span dir="ltr" className="font-mono">{f.bookingId}</span> — {errorMessage(new ApiError({ status: 0, code: f.code, message: f.message }))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ModalFooter>
              <Button onClick={onClose}>تم</Button>
            </ModalFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-3">
            <p className="text-sm">
              سيتم إلغاء <strong>{trip.confirmedBookings}</strong> حجز ({trip.ticketCount} تذكرة) واسترداد{' '}
              <strong>{formatSdg(trip.totalAmountMinor)}</strong> كاملة بدون رسوم إلغاء: حجوزات الوكلاء إلى محفظة المكتب مع
              استرجاع العمولة، والحجوزات المباشرة إلى وسيلة الدفع الأصلية. لا يمكن التراجع.
            </p>
            <label className="flex flex-col gap-1 text-xs font-semibold">
              سبب الإلغاء
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                rows={3}
                required
                className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-2 text-sm font-normal"
                placeholder="مثال: إيقاف الشركة الناقلة"
              />
            </label>
            {cancel.isError && <p className="text-xs text-error">{errorMessage(cancel.error)}</p>}
            <ModalFooter>
              <Button type="button" variant="outline" onClick={onClose}>تراجع</Button>
              <Button type="submit" variant="danger" disabled={!valid} isLoading={cancel.isPending}>تأكيد الإلغاء والاسترداد</Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
