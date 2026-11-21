import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { ApiError } from '../../../lib/api/client';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import {
  BOOKING_STATUS_LABEL,
  COMMISSION_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  TICKET_STATUS_LABEL,
  bookingRefLabel,
  bookingStatusVariant,
  downloadTicketPdf,
  useAdminBooking,
  useCancelAdminBooking,
  type AdminBooking,
  type AdminCancelResult,
} from '../api';

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
  <section className={`bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm ${className ?? ''}`}>
    <h2 className="font-bold text-on-surface flex items-center gap-2">
      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 py-1.5 border-b border-surface-container last:border-0 text-sm">
    <dt className="text-on-surface-variant">{label}</dt>
    <dd className="text-on-surface font-medium text-left">{children}</dd>
  </div>
);

function cancelErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.code === 'BOOKING_CHANNEL_UNSUPPORTED') return 'الإلغاء الإداري متاح لحجوزات مكاتب الوكلاء فقط.';
  return errorMessage(err);
}

const CancelBookingModal: React.FC<{ booking: AdminBooking; open: boolean; onOpenChange: (open: boolean) => void }> = ({ booking, open, onOpenChange }) => {
  const cancel = useCancelAdminBooking();
  const [reason, setReason] = React.useState('');
  const [result, setResult] = React.useState<AdminCancelResult | null>(null);
  const valid = reason.trim().length >= 3;

  const close = (next: boolean) => {
    if (!next) {
      setReason('');
      setResult(null);
      cancel.reset();
    }
    onOpenChange(next);
  };

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>إلغاء الحجز {bookingRefLabel(booking)}</ModalTitle>
          <ModalDescription>
            يُلغى الحجز وتُحرَّر المقاعد، ويُعاد كامل المبلغ ({formatSdg(booking.totalAmountMinor)}) إلى محفظة المكتب، وتُسترد العمولة المستحقة.
          </ModalDescription>
        </ModalHeader>

        {result ? (
          <dl className="rounded-lg bg-surface-container-low p-space-sm">
            <Field label="المبلغ المُعاد للمحفظة">{formatSdg(result.refundedAmountMinor)}</Field>
            <Field label="العمولة المستردة">{formatSdg(result.commissionClawedBackMinor)}</Field>
            <Field label="رصيد المحفظة بعد الإلغاء">{formatSdg(result.balanceAfterMinor)}</Field>
            {result.replayed && <p className="text-xs text-on-surface-variant pt-2">كان الحجز ملغى مسبقًا؛ هذه نتيجة الإلغاء السابق.</p>}
          </dl>
        ) : (
          <form
            id="cancel-booking-form"
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!valid) return;
              cancel.mutate({ id: booking.id, reason: reason.trim() }, { onSuccess: setResult });
            }}
          >
            <label htmlFor="cancel-reason" className="text-sm font-medium text-on-surface">سبب الإلغاء (إلزامي)</label>
            <textarea
              id="cancel-reason"
              className="w-full min-h-24 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-3 text-sm text-on-surface"
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: طلب العميل عبر المكتب بعد تعطل الرحلة"
            />
            {reason.length > 0 && !valid && <p className="text-xs text-error">السبب يجب أن يكون 3 أحرف على الأقل.</p>}
            {cancel.isError && <p role="alert" className="text-sm text-error">{cancelErrorMessage(cancel.error)}</p>}
          </form>
        )}

        <ModalFooter>
          {result ? (
            <Button onClick={() => close(false)}>تم</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => close(false)}>تراجع</Button>
              <Button variant="danger" type="submit" form="cancel-booking-form" disabled={!valid} isLoading={cancel.isPending}>
                تأكيد الإلغاء
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const TicketDownloadButton: React.FC<{ bookingId: string; ticketNumber: string }> = ({ bookingId, ticketNumber }) => {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="outline"
        size="sm"
        icon="picture_as_pdf"
        isLoading={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await downloadTicketPdf(bookingId, ticketNumber);
          } catch (err) {
            setError(errorMessage(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        PDF
      </Button>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
};

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const navigate = useNavigate();
  const query = useAdminBooking(id);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const b = query.data;

  const crumbs = [
    { label: 'الرئيسية والعمليات', path: '/overview' },
    { label: 'الحجوزات والتذاكر', path: '/bookings' },
    { label: b ? bookingRefLabel(b) : 'تفاصيل الحجز' },
  ];

  if (query.isLoading) {
    return (
      <div className="flex flex-col w-full gap-space-lg">
        <Breadcrumbs items={crumbs} />
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (query.isError || !b) {
    return (
      <div className="flex flex-col w-full gap-space-lg">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل الحجز" message={errorMessage(query.error)} onRetry={() => query.refetch()} />
        <Link to="/bookings" className="text-secondary text-sm">العودة إلى قائمة الحجوزات</Link>
      </div>
    );
  }

  // Admin cancel refunds the office wallet, so the backend only supports it for broker bookings.
  const cancelAllowed = can('bookings.cancel') && b.channel === 'BROKER';
  const canCancel = cancelAllowed && b.status === 'CONFIRMED';
  const passengerTickets = b.passengers.map((p) => ({ passenger: p, tickets: b.tickets.filter((t) => t.passengerId === p.id) }));

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-lg">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={`الحجز ${bookingRefLabel(b)}`}
        subtitle={`${b.trip.origin} ← ${b.trip.destination} · ${b.trip.company.name}`}
        badge={<Badge variant={bookingStatusVariant(b.status)}>{BOOKING_STATUS_LABEL[b.status]}</Badge>}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon="history" onClick={() => navigate(`/bookings/${b.id}/activity`)}>سجل النشاط</Button>
            {canCancel && (
              <Button variant="danger" icon="cancel" onClick={() => setCancelOpen(true)}>إلغاء الحجز</Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        <Section title="ملخص الرحلة" icon="directions_bus">
          <dl>
            <Field label="المسار">{b.trip.origin} ← {b.trip.destination}</Field>
            <Field label="شركة النقل">{b.trip.company.name}</Field>
            <Field label="موعد المغادرة">{formatDateTime(b.trip.departureAt)}</Field>
            <Field label="معرّف الرحلة"><span className="font-mono text-xs" dir="ltr">{b.trip.id}</span></Field>
          </dl>
        </Section>

        {b.channel === 'BROKER' ? (
          <Section title="مكتب الوكيل" icon="storefront">
            <dl>
              <Field label="المكتب">{b.office ? `${b.office.name} (${b.office.code})` : '—'}</Field>
              <Field label="الموظف المنفّذ">{b.employee?.displayName ?? '—'}</Field>
              <Field label="القناة">مكتب وكيل</Field>
            </dl>
          </Section>
        ) : (
          <Section title="العميل" icon="person">
            <dl>
              <Field label="القناة">تطبيق العميل</Field>
              <Field label="معرّف العميل"><span className="font-mono text-xs" dir="ltr">{b.customerId ?? '—'}</span></Field>
            </dl>
          </Section>
        )}

        <Section title="المبالغ والدفع" icon="payments">
          <dl>
            <Field label="إجمالي الحجز"><span className="tabular-nums">{formatSdg(b.totalAmountMinor)}</span></Field>
            <Field label="العمولة"><span className="tabular-nums">{formatSdg(b.commissionAmountMinor)}</span></Field>
            <Field label="حالة العمولة">{b.commissionStatus ? COMMISSION_STATUS_LABEL[b.commissionStatus] ?? b.commissionStatus : '—'}</Field>
            <Field label="طريقة الدفع">{PAYMENT_METHOD_LABEL[b.paymentMethod] ?? b.paymentMethod}</Field>
            <Field label="حالة الدفع">{PAYMENT_STATUS_LABEL[b.paymentStatus] ?? b.paymentStatus}</Field>
          </dl>
        </Section>

        <Section title="التواريخ" icon="schedule">
          <dl>
            <Field label="أُنشئ">{formatDateTime(b.createdAt)}</Field>
            <Field label="أُكّد">{formatDateTime(b.confirmedAt)}</Field>
            <Field label="أُلغي">{formatDateTime(b.cancelledAt)}</Field>
            <Field label="معرّف الحجز"><span className="font-mono text-xs" dir="ltr">{b.id}</span></Field>
          </dl>
        </Section>
      </div>

      <Section title={`الركاب والتذاكر (${b.passengers.length})`} icon="confirmation_number">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الراكب</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>رقم الهوية</TableHead>
              <TableHead>المقعد</TableHead>
              <TableHead>رقم التذكرة</TableHead>
              <TableHead>حالة التذكرة</TableHead>
              <TableHead>التذكرة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passengerTickets.flatMap(({ passenger, tickets }) =>
              (tickets.length ? tickets : [null]).map((t, i) => (
                <TableRow key={t?.id ?? passenger.id}>
                  <TableCell>{i === 0 ? passenger.fullName : ''}</TableCell>
                  <TableCell dir="ltr" className="text-right">{i === 0 ? passenger.phone ?? '—' : ''}</TableCell>
                  <TableCell>{i === 0 ? passenger.idNumber ?? '—' : ''}</TableCell>
                  <TableCell>{t?.seatLabel ?? '—'}</TableCell>
                  <TableCell className="font-mono text-xs" dir="ltr">{t?.ticketNumber ?? '—'}</TableCell>
                  <TableCell>
                    {t ? (
                      <Badge variant={t.status === 'CONFIRMED' ? 'success' : t.status === 'CANCELLED' ? 'error' : 'neutral'}>
                        {TICKET_STATUS_LABEL[t.status] ?? t.status}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{t ? <TicketDownloadButton bookingId={b.id} ticketNumber={t.ticketNumber} /> : null}</TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
        </Table>
      </Section>

      {/* Stays mounted after a successful cancel (status flips to CANCELLED) so the result remains visible. */}
      {cancelAllowed && <CancelBookingModal booking={b} open={cancelOpen} onOpenChange={setCancelOpen} />}
    </div>
  );
};
