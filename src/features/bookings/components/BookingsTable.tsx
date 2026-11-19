import * as React from 'react';
import { Link } from 'react-router-dom';
import type { Booking, BookingsFilterState } from '../types/booking';

interface BookingsTableProps {
  bookings: Booking[];
  totalCount: number;
  filteredCount: number;
  filters: BookingsFilterState;
  onFilterChange: (newFilters: Partial<BookingsFilterState>) => void;
  onSelectBookingForTicket?: (booking: Booking) => void;
  isLoading?: boolean;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  filteredCount,
  filters,
  onFilterChange,
  onSelectBookingForTicket,
  isLoading = false,
}) => {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(bookings.map((b) => b.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const totalPages = Math.max(1, Math.ceil(filteredCount / filters.pageSize));
  const currentPage = filters.page;

  const renderSortArrow = (field: BookingsFilterState['sortBy']) => {
    if (filters.sortBy !== field) return null;
    return (
      <span className="material-symbols-outlined text-xs">
        {filters.sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  const toggleSort = (field: BookingsFilterState['sortBy']) => {
    if (filters.sortBy === field) {
      onFilterChange({
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    } else {
      onFilterChange({
        sortBy: field,
        sortOrder: 'desc',
        page: 1,
      });
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      {/* Selection Operational Ribbon */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-800 text-lg">checklist</span>
          <span>
            تم تحديد <strong className="text-slate-900 font-bold">{selectedIds.size}</strong> حجز من إجمالي الجدول ({filteredCount})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            عرض {bookings.length} من {filteredCount} حجز
          </span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <th className="p-3.5 pr-4 w-10">
                <input
                  type="checkbox"
                  checked={bookings.length > 0 && selectedIds.size === bookings.length}
                  onChange={handleSelectAll}
                  className="rounded w-4 h-4 text-emerald-700 focus:ring-0 cursor-pointer"
                />
              </th>
              <th
                onClick={() => toggleSort('createdAt')}
                className="p-3.5 whitespace-nowrap cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>رقم الحجز</span>
                  {renderSortArrow('createdAt')}
                </div>
              </th>
              <th
                onClick={() => toggleSort('passengerCount')}
                className="p-3.5 whitespace-nowrap cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>المسافر الرئيسي</span>
                  {renderSortArrow('passengerCount')}
                </div>
              </th>
              <th className="p-3.5 whitespace-nowrap">مصدر الحجز</th>
              <th className="p-3.5 whitespace-nowrap">شركة النقل</th>
              <th className="p-3.5 whitespace-nowrap">المسار</th>
              <th
                onClick={() => toggleSort('departureTime')}
                className="p-3.5 whitespace-nowrap cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>موعد الرحلة</span>
                  {renderSortArrow('departureTime')}
                </div>
              </th>
              <th
                onClick={() => toggleSort('totalAmount')}
                className="p-3.5 text-left whitespace-nowrap cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>إجمالي الحجز</span>
                  {renderSortArrow('totalAmount')}
                </div>
              </th>
              <th className="p-3.5 text-center whitespace-nowrap">حالة الدفع</th>
              <th className="p-3.5 text-center whitespace-nowrap">حالة التذكرة</th>
              <th className="p-3.5 text-center whitespace-nowrap">حالة الحجز</th>
              <th className="p-3.5 pl-4 text-center whitespace-nowrap">الإجراءات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-800">
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={12} className="p-4">
                    <div className="h-5 bg-slate-100 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : bookings.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-2xl">search_off</span>
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">لا توجد حجوزات تطابق معايير الفلترة المحددة</span>
                    <p className="text-xs text-slate-500 max-w-sm">
                      جرّب تعديل الكلمات المفتاحية أو مسح الفلاتر المحددة لعرض المزيد من السجلات.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        onFilterChange({
                          searchQuery: '',
                          source: 'all',
                          bookingStatus: 'all',
                          paymentStatus: 'all',
                          ticketStatus: 'all',
                          carrierId: 'all',
                          brokerId: 'all',
                          routeId: 'all',
                          datePreset: 'all',
                          page: 1,
                        })
                      }
                      className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                    >
                      إعادة تعيين كافة الفلاتر
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const isSelected = selectedIds.has(booking.id);
                const isFailureCase = booking.ticketStatus === 'issue_failed';

                return (
                  <tr
                    key={booking.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isFailureCase
                        ? 'bg-rose-50/40'
                        : isSelected
                        ? 'bg-emerald-50/30'
                        : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 pr-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(booking.id, e as unknown as React.MouseEvent)}
                        className="rounded w-4 h-4 text-emerald-700 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Booking ID */}
                    <td className="p-3.5 whitespace-nowrap">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="text-emerald-800 hover:underline font-bold font-mono tracking-tight"
                      >
                        {booking.id}
                      </Link>
                      <div className="text-[11px] text-slate-500">
                        مقعد {booking.passengers[0]?.seatNumber || '—'} • {booking.passengers[0]?.seatClass === 'vip' ? 'VIP' : 'عادي'}
                      </div>
                    </td>

                    {/* Main Passenger */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{booking.mainPassengerName}</span>
                        {booking.passengerCount > 1 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {booking.passengerCount} ركاب
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono" dir="ltr">
                        {booking.passengers[0]?.maskedPhone || booking.mainPassengerPhone}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="p-3.5 whitespace-nowrap">
                      {booking.source === 'broker_office' ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold w-fit">
                            <span className="material-symbols-outlined text-xs">storefront</span>
                            <span>مكتب وسيط</span>
                          </span>
                          <span className="text-[11px] text-slate-600 mt-0.5 truncate max-w-[140px]">
                            {booking.brokerMeta?.brokerName}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-xs">smartphone</span>
                          <span>تطبيق العميل</span>
                        </span>
                      )}
                    </td>

                    {/* Carrier */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{booking.carrierName}</div>
                      <div className="text-[11px] text-slate-500">
                        {booking.tripId} {booking.vehiclePlate ? `• ${booking.vehiclePlate}` : ''}
                      </div>
                    </td>

                    {/* Route */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <span>{booking.routeName.split('←')[0]}</span>
                        <span className="material-symbols-outlined text-xs text-slate-400">arrow_left_alt</span>
                        <span>{booking.routeName.split('←')[1]}</span>
                      </div>
                    </td>

                    {/* Departure Date/Time */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{booking.departureDate}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{booking.departureTime}</div>
                    </td>

                    {/* Total Amount */}
                    <td className="p-3.5 text-left font-mono font-bold text-slate-900 whitespace-nowrap">
                      {booking.totalAmount.toLocaleString('en-US')}{' '}
                      <span className="text-[11px] font-normal text-slate-500">ج.س</span>
                    </td>

                    {/* Separate Payment Status */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {booking.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>مدفوع</span>
                        </span>
                      ) : booking.paymentStatus === 'pending_verification' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          <span>في التحقق</span>
                        </span>
                      ) : booking.paymentStatus === 'refunded' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-xs">assignment_return</span>
                          <span>مسترد</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                          غير مدفوع
                        </span>
                      )}
                    </td>

                    {/* Separate Ticket Status */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {booking.ticketStatus === 'issued' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-xs text-emerald-700">qr_code</span>
                          <span>صادرة</span>
                        </span>
                      ) : booking.ticketStatus === 'issue_failed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-[#8E1B32] border border-rose-200 text-[11px] font-bold animate-pulse">
                          <span className="material-symbols-outlined text-xs">report_problem</span>
                          <span>تعذر الإصدار</span>
                        </span>
                      ) : booking.ticketStatus === 'pending_issue' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                          <span>لم تصدر</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium">
                          <span>ملغاة</span>
                        </span>
                      )}
                    </td>

                    {/* Separate Booking Status */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          booking.status === 'confirmed'
                            ? 'bg-slate-100 text-slate-800'
                            : booking.status === 'pending'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {booking.status === 'confirmed'
                          ? 'مؤكد'
                          : booking.status === 'pending'
                          ? 'معلق'
                          : 'ملغى'}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="p-3.5 pl-4 text-center relative whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/bookings/${booking.id}`}
                          className="p-1 rounded hover:bg-slate-100 text-emerald-800 transition-colors"
                          title="عرض تفاصيل الحجز"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === booking.id ? null : booking.id);
                          }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="خيارات إضافية"
                        >
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {openDropdownId === booking.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-8 top-10 w-48 rounded-xl bg-white shadow-lg border border-slate-100 py-1.5 z-30 text-right flex flex-col"
                        >
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm text-emerald-700">open_in_new</span>
                            <span>عرض التفاصيل</span>
                          </Link>
                          {booking.tickets.length > 0 && onSelectBookingForTicket && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                onSelectBookingForTicket(booking);
                              }}
                              className="w-full text-right px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm text-emerald-700">
                                confirmation_number
                              </span>
                              <span>معاينة التذكرة الرقمية</span>
                            </button>
                          )}
                          <Link
                            to={`/bookings/${booking.id}/activity`}
                            className="px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm text-emerald-700">history</span>
                            <span>سجل النشاط والتدقيق المالي</span>
                          </Link>
                          {booking.vehicleId ? (
                            <Link
                              to={`/tracking?busId=${booking.vehicleId}`}
                              className="px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm text-emerald-700">share_location</span>
                              <span>تتبع الحافلة ({booking.vehicleId})</span>
                            </Link>
                          ) : (
                            <span className="px-3.5 py-2 text-xs font-medium text-slate-400 flex items-center gap-2 cursor-not-allowed">
                              <span className="material-symbols-outlined text-sm text-slate-300">location_off</span>
                              <span>الحافلة غير مخصصة بعد</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">عدد النتائج في الصفحة:</span>
          <select
            value={filters.pageSize}
            onChange={(e) =>
              onFilterChange({ pageSize: Number(e.target.value), page: 1 })
            }
            className="h-8 px-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-700"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onFilterChange({ page: currentPage - 1 })}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            السابق
          </button>

          <span className="px-3 py-1 font-semibold text-slate-800 font-mono">
            صفحة {currentPage} من {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onFilterChange({ page: currentPage + 1 })}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
};
