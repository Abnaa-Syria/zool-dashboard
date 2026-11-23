import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { Pager } from '../../admin/components/AdminUi';
import {
  BOOKING_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  bookingRefLabel,
  bookingStatusVariant,
  useAdminBookings,
  type AdminBookingFilters,
} from '../api';

type Scope = Pick<AdminBookingFilters, 'customerId' | 'officeId' | 'companyId' | 'employeeId'>;

/** Paginated bookings of one customer / office / carrier (GET /admin/bookings), rows open the booking page. */
export const RelatedBookingsTable: React.FC<{
  scope: Scope;
  emptyText?: string;
  /** Hide the column that equals the scope (e.g. the carrier on a carrier page). */
  hide?: Array<'company' | 'office'>;
  pageSize?: number;
  enabled?: boolean;
}> = ({ scope, emptyText = 'لا توجد حجوزات.', hide = [], pageSize = 10, enabled = true }) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const bookings = useAdminBookings({ ...scope, page, pageSize }, enabled);
  const rows = bookings.data?.data ?? [];
  if (!enabled) return null;
  if (bookings.isLoading) return <Skeleton className="h-32 rounded-lg" />;
  if (bookings.isError) return <p className="text-xs text-error">{errorMessage(bookings.error)}</p>;
  if (rows.length === 0) return <p className="text-sm text-on-surface-variant">{emptyText}</p>;
  const showCompany = !hide.includes('company');
  const showOffice = !hide.includes('office');
  return (
    <div className="space-y-space-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المرجع</TableHead>
            <TableHead>الرحلة</TableHead>
            {showCompany && <TableHead>الشركة</TableHead>}
            {showOffice && <TableHead>القناة</TableHead>}
            <TableHead>المقاعد</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الدفع</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((b) => (
            <TableRow key={b.id} className="cursor-pointer" onClick={() => navigate(`/bookings/${b.id}`)}>
              <TableCell className="font-mono text-xs" dir="ltr">{bookingRefLabel(b)}</TableCell>
              <TableCell>
                <div>{b.trip.origin} ← {b.trip.destination}</div>
                <div className="text-xs text-on-surface-variant">{formatDateTime(b.trip.departureAt)}</div>
              </TableCell>
              {showCompany && <TableCell>{b.trip.company.name}</TableCell>}
              {showOffice && <TableCell>{b.office ? b.office.name : 'تطبيق العميل'}</TableCell>}
              <TableCell className="tabular-nums">{b.tickets.length}</TableCell>
              <TableCell className="tabular-nums">{formatSdg(b.totalAmountMinor)}</TableCell>
              <TableCell>{PAYMENT_METHOD_LABEL[b.paymentMethod] ?? b.paymentMethod}</TableCell>
              <TableCell><Badge variant={bookingStatusVariant(b.status)}>{BOOKING_STATUS_LABEL[b.status]}</Badge></TableCell>
              <TableCell>
                <Link to={`/bookings/${b.id}`} className="text-secondary font-medium" onClick={(e) => e.stopPropagation()}>عرض</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {bookings.data?.meta && bookings.data.meta.totalPages > 1 && <Pager meta={bookings.data.meta} onPage={setPage} disabled={bookings.isFetching} />}
    </div>
  );
};
