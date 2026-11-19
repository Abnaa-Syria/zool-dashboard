import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/Badge';
import type { RecentBookingItem } from '../../../types/overview';
import { formatCurrency } from '../../../lib/utils';

export interface RecentBookingsTableProps {
  bookings: RecentBookingItem[];
}

export const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({ bookings }) => {
  return (
    <div className="flex flex-col gap-space-sm text-right">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-on-surface">أحدث الحجوزات المسجلة على المنصة</h3>
          <p className="text-[11px] text-on-surface-variant">
            سجل العمليات الصادرة مؤخراً عبر خطوط النقل المشتركة ووكالات السفر
          </p>
        </div>
        <Link
          to="/bookings"
          className="text-xs font-semibold text-secondary hover:text-secondary-fixed-variant flex items-center gap-1 transition-colors"
        >
          <span>عرض كل الحجوزات</span>
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الحجز المرجعي</TableHead>
            <TableHead>المسافر والمسار</TableHead>
            <TableHead>شركة النقل</TableHead>
            <TableHead>المقعد والانطلاق</TableHead>
            <TableHead>قناة الحجز</TableHead>
            <TableHead>القيمة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الدفع والتوثيق</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const isBroker = booking.channel === 'broker_office';

            return (
              <TableRow key={booking.id} className="group">
                {/* Reference ID */}
                <TableCell className="font-mono text-xs font-bold text-on-surface">
                  <span className="bg-surface-container px-2 py-1 rounded border border-outline-variant/30">
                    {booking.id}
                  </span>
                </TableCell>

                {/* Passenger & Route */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-on-surface">
                      {booking.passengerName}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {booking.route}
                    </span>
                  </div>
                </TableCell>

                {/* Carrier */}
                <TableCell className="text-xs font-medium text-on-surface">
                  {booking.carrierName}
                </TableCell>

                {/* Seat & Departure */}
                <TableCell>
                  <div className="flex flex-col text-xs tabular-nums">
                    <span className="font-bold text-secondary">مقعد {booking.seatNumber}</span>
                    <span className="text-[11px] text-outline">{booking.departureTime}</span>
                  </div>
                </TableCell>

                {/* Booking Channel */}
                <TableCell>
                  <div className="flex flex-col items-start gap-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isBroker
                          ? 'bg-primary-container text-on-primary'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {isBroker ? 'storefront' : 'person'}
                      </span>
                      <span>{booking.channelLabel}</span>
                    </span>
                    {isBroker && booking.brokerName && (
                      <span className="text-[10px] text-outline truncate max-w-[120px]">
                        {booking.brokerName}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Amount */}
                <TableCell className="font-bold text-xs tabular-nums text-on-surface">
                  {formatCurrency(booking.amount)}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>

                {/* Payment Method & Time */}
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-on-surface text-[11px]">
                      {booking.paymentMethod}
                    </span>
                    <span className="text-[10px] text-outline font-mono">
                      {booking.createdAt}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
