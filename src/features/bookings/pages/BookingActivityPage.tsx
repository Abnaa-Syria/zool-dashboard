import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import {
  AUDIT_ACTION_LABEL,
  BOOKING_STATUS_LABEL,
  bookingRefLabel,
  bookingStatusVariant,
  useAdminBooking,
  useBookingAuditLogs,
  type AuditLogEntry,
} from '../api';

/** Readable lines for the metadata keys the bookings module writes; anything else is shown raw. */
function describeMetadata(entry: AuditLogEntry): string[] {
  const m = entry.metadata ?? {};
  const lines: string[] = [];
  const num = (k: string) => (typeof m[k] === 'number' ? (m[k] as number) : undefined);
  if (typeof m.reason === 'string') lines.push(`السبب: ${m.reason}`);
  if (Array.isArray(m.seatLabels)) lines.push(`المقاعد: ${m.seatLabels.join('، ')}`);
  const total = num('totalAmount') ?? num('refundedAmountMinor') ?? num('refundedAmount');
  if (total !== undefined) lines.push(`${entry.action.startsWith('booking.cancelled') ? 'المبلغ المُعاد' : 'المبلغ'}: ${formatSdg(total)}`);
  const commission = num('commissionAmount') ?? num('commissionClawedBack');
  if (commission !== undefined) lines.push(`${entry.action.startsWith('booking.cancelled') ? 'العمولة المستردة' : 'العمولة'}: ${formatSdg(commission)}`);
  const balance = num('balanceAfter');
  if (balance !== undefined) lines.push(`رصيد المحفظة بعدها: ${formatSdg(balance)}`);
  if (typeof m.channel === 'string') lines.push(`قناة الإرسال: ${m.channel}`);
  if (typeof m.status === 'string') lines.push(`الحالة: ${m.status}`);
  return lines;
}

function actorLabel(entry: AuditLogEntry): string {
  if (entry.actorAdminId) return `مسؤول (${entry.actorAdminId.slice(-8)})`;
  const m = entry.metadata ?? {};
  if (typeof m.employeeId === 'string') return `موظف المكتب (${m.employeeId.slice(-8)})`;
  return 'النظام';
}

const AuditTrail: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const logs = useBookingAuditLogs(bookingId, true);
  if (logs.isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (logs.isError) return <ErrorState title="تعذّر تحميل سجل التدقيق" message={errorMessage(logs.error)} onRetry={() => logs.refetch()} />;
  const entries = [...(logs.data ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (entries.length === 0) return <EmptyState title="لا توجد أحداث مسجلة لهذا الحجز" icon="history" />;

  return (
    <ol className="relative border-s border-outline-variant/50 ms-3 space-y-space-md">
      {entries.map((e) => (
        <li key={e.id} className="ms-6">
          <span className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-secondary" aria-hidden />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-on-surface">{AUDIT_ACTION_LABEL[e.action] ?? e.action}</span>
            <span className="text-xs text-on-surface-variant">{formatDateTime(e.createdAt)}</span>
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">بواسطة: {actorLabel(e)}</div>
          {describeMetadata(e).length > 0 && (
            <ul className="mt-1 text-sm text-on-surface space-y-0.5">
              {describeMetadata(e).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          {e.requestId && (
            <div className="text-[11px] text-on-surface-variant font-mono mt-1" dir="ltr">req {e.requestId}</div>
          )}
        </li>
      ))}
    </ol>
  );
};

export const BookingActivityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const booking = useAdminBooking(id);
  const b = booking.data;
  const ref = b ? bookingRefLabel(b) : undefined;

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-lg">
      <Breadcrumbs
        items={[
          { label: 'الرئيسية والعمليات', path: '/overview' },
          { label: 'الحجوزات والتذاكر', path: '/bookings' },
          { label: ref ?? 'تفاصيل الحجز', path: `/bookings/${id}` },
          { label: 'سجل النشاط' },
        ]}
      />
      <PageHeader
        title={ref ? `سجل نشاط الحجز ${ref}` : 'سجل نشاط الحجز'}
        subtitle="الأحداث المسجلة في سجل التدقيق لهذا الحجز."
        badge={b ? <Badge variant={bookingStatusVariant(b.status)}>{BOOKING_STATUS_LABEL[b.status]}</Badge> : undefined}
        actions={<Link to={`/bookings/${id}`} className="text-sm text-secondary">العودة إلى تفاصيل الحجز</Link>}
      />

      {booking.isError && (
        <ErrorState title="تعذّر تحميل الحجز" message={errorMessage(booking.error)} onRetry={() => booking.refetch()} />
      )}

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {!id ? null : can('audit.view') ? (
          <AuditTrail bookingId={id} />
        ) : (
          <EmptyState
            title="سجل التدقيق غير متاح"
            description="عرض سجل نشاط الحجز يتطلب صلاحية «audit.view». تواصل مع مسؤول النظام لمنحك الصلاحية."
            icon="lock"
          />
        )}
      </section>
    </div>
  );
};
