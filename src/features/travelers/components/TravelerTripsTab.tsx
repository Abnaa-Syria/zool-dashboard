import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Traveler, TravelerTripItem } from '../types/traveler';

interface TravelerTripsTabProps {
  traveler: Traveler;
  trips: TravelerTripItem[];
  onOpenTicketPreview: (bookingRef: string) => void;
}

export const TravelerTripsTab: React.FC<TravelerTripsTabProps> = ({
  traveler,
  trips,
  onOpenTicketPreview,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');

  const filteredTrips = trips.filter((trip) => {
    if (statusFilter !== 'all' && trip.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        trip.bookingReference.toLowerCase().includes(q) ||
        trip.tripNumber.toLowerCase().includes(q) ||
        trip.origin.city.toLowerCase().includes(q) ||
        trip.destination.city.toLowerCase().includes(q) ||
        trip.carrierName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const completedCount = trips.filter((t) => t.status === 'completed').length;
  const activeCount = trips.filter((t) => t.status === 'active').length;
  const cancelledCount = trips.filter((t) => t.status === 'cancelled').length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Main Stream (9 Cols) */}
      <div className="xl:col-span-9 flex flex-col gap-5">
        {/* Filter Controls Toolbar */}
        <div className="bg-white rounded-xl p-4 border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg w-full md:w-auto overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-primary-dark shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              الكل ({trips.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === 'active'
                  ? 'bg-white text-primary-dark shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              القادمة والجارية ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-white text-primary-dark shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              المكتملة ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                statusFilter === 'cancelled'
                  ? 'bg-white text-primary-dark shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              الملغاة والمستردة ({cancelledCount})
            </button>
          </div>

          {/* Search & Year */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث برقم الحجز أو المحطة..."
                className="w-full h-9 pr-9 pl-3 rounded-lg bg-surface-subtle text-text-primary placeholder:text-text-muted text-xs border border-transparent focus:border-primary-dark focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="relative">
              <select
                aria-label="السنة"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-9 pr-3 pl-7 rounded-lg bg-surface-subtle text-text-primary text-xs font-semibold appearance-none cursor-pointer border border-transparent focus:border-primary-dark outline-none"
              >
                <option value="2024">عام 2024</option>
                <option value="2023">عام 2023</option>
                <option value="2022">عام 2022</option>
              </select>
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* TRIP CARDS STREAM */}
        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-border text-text-muted">
            <span className="material-symbols-outlined text-[36px] mb-2">airline_seat_recline_extra</span>
            <p className="font-semibold">لا توجد رحلات مطابقة في هذا التصنيف</p>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const isLive = trip.status === 'active';

            if (isLive) {
              return (
                <div
                  key={trip.id}
                  className="relative rounded-xl bg-white border border-emerald-300 shadow-md overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Top Live Banner Strip */}
                  <div className="bg-emerald-100 px-5 py-2.5 flex items-center justify-between text-emerald-900 text-xs font-bold border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                      </span>
                      <span>الرحلة على الطريق الآن (جارية)</span>
                      <span className="text-emerald-700 font-normal">• تم المغادرة في الوقت المحدد</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-emerald-800">{trip.dateStr}</span>
                      <span className="px-2 py-0.5 rounded bg-white text-emerald-800 font-bold shadow-xs">
                        بث GPS مباشر
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col gap-5">
                    {/* Route Corridor Visualizer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Origin */}
                      <div className="flex flex-col text-center sm:text-right">
                        <span className="text-xs text-text-muted">نقطة الانطلاق ({trip.departureTimeText})</span>
                        <span className="text-lg font-bold text-primary-dark">{trip.origin.city}</span>
                        <span className="text-xs text-text-muted">{trip.origin.stationName}</span>
                      </div>

                      {/* Route Progress Graphic */}
                      <div className="flex-1 w-full max-w-sm px-4 flex flex-col items-center">
                        <div className="flex items-center justify-between w-full text-xs text-text-muted mb-1 font-semibold">
                          <span>تم قطع {trip.progressPercent}%</span>
                          <span>متبقي {trip.distanceRemainingKm} كم</span>
                        </div>
                        <div className="relative w-full h-2.5 rounded-full bg-emerald-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${trip.progressPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-emerald-700 font-bold">
                          <span className="material-symbols-outlined text-[14px]">directions_bus</span>
                          <span>{trip.corridorName}</span>
                        </div>
                      </div>

                      {/* Destination */}
                      <div className="flex flex-col text-center sm:text-left">
                        <span className="text-xs text-text-muted">الوجهة المستهدفة ({trip.arrivalTimeText})</span>
                        <span className="text-lg font-bold text-primary-dark">{trip.destination.city}</span>
                        <span className="text-xs text-text-muted">{trip.destination.stationName}</span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-surface-subtle text-xs">
                      <div className="flex flex-col">
                        <span className="text-text-muted">رقم الحجز:</span>
                        <span className="font-mono font-bold text-primary-dark">{trip.bookingReference}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-muted">الرحلة المشغلة:</span>
                        <span className="font-mono font-bold text-text-primary">{trip.tripNumber}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-muted">الناقل والحافلة:</span>
                        <span className="font-semibold text-text-primary">
                          {trip.carrierName} ({trip.busId})
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-muted">رقم المقعد والدرجة:</span>
                        <span className="font-bold text-emerald-800">
                          مقعد {trip.seatNumber} ({trip.seatType})
                        </span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">قيمة التذكرة المدفوعة:</span>
                        <span className="text-base font-bold text-primary-dark tabular-nums">
                          {trip.priceSdg.toFixed(2)} ج.س
                        </span>
                        <span className="text-xs text-emerald-700 font-medium">({trip.paymentMethod})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenTicketPreview(trip.bookingReference)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-emerald-50 text-primary-dark text-xs font-bold border border-border transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">print</span>
                          <span>معاينة وطباعة التذكرة</span>
                        </button>

                        <Link
                          to={`/tracking?busId=${trip.busId}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">near_me</span>
                          <span>تتبع الحافلة مباشرة</span>
                        </Link>

                        <Link
                          to={`/bookings/${trip.bookingReference}/activity`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-border text-text-primary text-xs font-semibold border border-border transition-colors"
                        >
                          <span>سجل الحجز والتدقيق</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Completed or Cancelled Trip Cards
            const isCompleted = trip.status === 'completed';

            return (
              <div
                key={trip.id}
                className="rounded-xl bg-white border border-border p-5 shadow-xs hover:shadow-sm transition-all flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCompleted ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-bold text-sm text-text-primary">
                      {trip.origin.city} ⟵ {trip.destination.city}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isCompleted ? 'رحلة مكتملة' : 'ملغاة ومستردة'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="font-mono">{trip.dateStr}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-primary-dark">{trip.bookingReference}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted block">الناقل:</span>
                    <span className="font-semibold text-text-primary">{trip.carrierName}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">رقم الحافلة والمقعد:</span>
                    <span className="font-semibold text-text-primary">
                      {trip.busId} • مقعد {trip.seatNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block">المسار:</span>
                    <span className="font-semibold text-text-primary">{trip.corridorName}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">قيمة التذكرة:</span>
                    <span className="font-bold text-primary-dark tabular-nums">
                      {trip.priceSdg.toFixed(2)} ج.س
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => onOpenTicketPreview(trip.bookingReference)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-border text-primary-dark text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt</span>
                    <span>معاينة التذكرة</span>
                  </button>
                  <Link
                    to={`/bookings/${trip.bookingReference}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-border text-text-primary text-xs font-semibold transition-colors"
                  >
                    <span>تفاصيل الحجز</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Side Column: Analytics & Sudanese Transit Matrix (3 Cols) */}
      <div className="xl:col-span-3 flex flex-col gap-5">
        {/* Geographic Routes Widget */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="font-bold text-sm text-primary-dark flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">map</span>
              <span>المسارات الأكثر سفراً</span>
            </span>
            <span className="text-xs text-text-muted">السودان</span>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-subtle flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-text-primary">الخرطوم ⟵ بورتسودان</span>
                <span className="text-[11px] text-text-muted">طريق التحدي السريع</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                8 رحلات
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-subtle flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-text-primary">الخرطوم ⟵ مروي</span>
                <span className="text-[11px] text-text-muted">شريان الشمال</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                4 رحلات
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-subtle flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-text-primary">الخرطوم ⟵ عطبرة</span>
                <span className="text-[11px] text-text-muted">طريق التحدي</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted font-bold">
                2 رحلات
              </span>
            </div>
          </div>
        </div>

        {/* Loyalty & Points Widget */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-xs flex flex-col gap-3">
          <span className="font-bold text-sm text-primary-dark flex items-center gap-1.5 pb-2 border-b border-border">
            <span className="material-symbols-outlined text-[18px] text-amber-500">stars</span>
            <span>برنامج الولاء ونقاط المكافآت</span>
          </span>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">عضو بلاتيني ممتاز</span>
              <span className="text-sm font-bold text-amber-900 tabular-nums">
                {traveler.rewardPoints} نقطة
              </span>
            </div>
            <span className="text-[11px] text-amber-800">
              يؤهل لخصم 15% على حجوزات العائلة واستبدال النقاط بتذاكر مجانية.
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-text-muted">الرصيد النقدي في المحفظة:</span>
            <span className="font-bold text-primary-dark tabular-nums">
              {traveler.walletBalanceSdg.toFixed(2)} ج.س
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
