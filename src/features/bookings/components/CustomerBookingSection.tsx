import * as React from 'react';
import type { Booking } from '../types/booking';

interface CustomerBookingSectionProps {
  booking: Booking;
}

export const CustomerBookingSection: React.FC<CustomerBookingSectionProps> = ({ booking }) => {
  return (
    <div className="flex flex-col gap-5">
      {/* 1. Booking Contact Account vs Passengers (CLEAR SEPARATION) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">contact_mail</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">بيانات حساب الاتصال وطالب الحجز</h2>
              <span className="text-xs text-slate-500">معلومات الحساب المشتري والمخاطب (مفصولة عن بيانات المسافرين)</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            {booking.customerMeta?.customerAccountId ? 'حساب مسافر مسجل' : 'حجز زائر سريع'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500">اسم صاحب الطلب / الحساب</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5">
              {booking.customerMeta?.registeredName || booking.mainPassengerName}
            </span>
            {booking.customerMeta?.customerAccountId && (
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                معرف الحساب: {booking.customerMeta.customerAccountId}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500">هاتف التواصل والإشعارات</span>
            <span className="text-xs font-mono font-bold text-slate-900 mt-0.5" dir="ltr">
              {booking.customerMeta?.contactPhone || booking.mainPassengerPhone}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500">البريد الإلكتروني للتوثيق</span>
            <span className="text-xs font-mono text-slate-700 mt-0.5 truncate">
              {booking.customerMeta?.contactEmail || 'غير مسجل (حجز عبر الهاتف)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Passengers & Assigned Seats (Supports Multi-Passenger Bookings) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">group</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">قائمة المسافرين والمقاعد المخصصة</h2>
              <span className="text-xs text-slate-500">بيانات الهوية المشفرة لكل راكب على مانيفست الرحلة</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            {booking.passengerCount} {booking.passengerCount === 1 ? 'مسافر' : 'ركاب'}
          </span>
        </div>

        <div className="flex flex-col divide-y divide-slate-100">
          {booking.passengers.map((passenger, idx) => (
            <div
              key={passenger.id}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{passenger.name}</span>
                    {passenger.isMainPassenger && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        المسافر الرئيسي
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      {passenger.passengerType === 'child' ? 'طفل' : 'بالغ'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-slate-400">phone</span>
                      <span className="font-mono" dir="ltr">{passenger.maskedPhone}</span>
                    </span>
                    {passenger.maskedNationalId && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-slate-400">fingerprint</span>
                        <span>الرقم الوطني: <strong className="font-mono">{passenger.maskedNationalId}</strong></span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Seat & Ticket Badge */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm text-emerald-700">airline_seat_recline_extra</span>
                  <span>مقعد {passenger.seatNumber} ({passenger.seatClass === 'vip' ? 'VIP' : 'عادي'})</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {passenger.ticketNumber}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Payment Method & Financial Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">ملخص الدفع والفوترة الإلكترونية</h2>
              <span className="text-xs text-slate-500">تفاصيل وسيلة السداد والتحقق المصرفي</span>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              booking.paymentStatus === 'paid'
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {booking.paymentStatus === 'paid' ? 'مدفوع بالكامل' : 'في انتظار التحقق المصرفي'}
          </span>
        </div>

        {/* Breakdown Items */}
        <div className="flex flex-col divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-600">
              سعر التذاكر الأساسي ({booking.carrierName} × {booking.passengerCount} مقاعد)
            </span>
            <span className="font-mono font-bold text-slate-900">
              {(booking.baseTicketFare * booking.passengerCount).toLocaleString('en-US')}{' '}
              <span className="text-[11px] font-normal text-slate-500">ج.س</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-600">رسوم المنصة والخدمة الرقمية</span>
            <span className="font-mono font-bold text-emerald-700">
              {booking.serviceFee.toFixed(2)} <span className="text-[11px] font-normal text-slate-500">ج.س</span>
            </span>
          </div>

          {booking.discountAmount > 0 && (
            <div className="flex items-center justify-between py-2.5 text-rose-700 font-semibold">
              <span>خصم ترويجي أو قسيمة</span>
              <span className="font-mono">
                -{booking.discountAmount.toFixed(2)} <span className="text-[11px] font-normal">ج.س</span>
              </span>
            </div>
          )}

          {/* Total Hero */}
          <div className="mt-3 p-4 rounded-xl bg-emerald-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">إجمالي المبلغ المسدد</span>
              <span className="text-[11px] text-emerald-100/80">شامل كافة الرسوم والضرائب المعتمدة</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-white">
                {booking.totalAmount.toLocaleString('en-US')}
              </span>
              <span className="text-sm font-semibold text-emerald-200">ج.س</span>
            </div>
          </div>
        </div>

        {/* Gateway Metadata Card */}
        {booking.customerMeta && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">بوابة الدفع المعتمدة</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-emerald-800 font-bold shadow-xs">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>{booking.customerMeta.paymentMethod}</span>
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
              <span className="text-slate-500">مرجع المعاملة (Gateway Txn Ref)</span>
              <span className="font-mono font-bold text-slate-900 select-all">
                {booking.customerMeta.paymentTransactionRef}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">توقيت إتمام الدفع</span>
              <span className="font-medium text-slate-800">{booking.customerMeta.paymentTimestamp}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">حالة التسوية المصرفية</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>
                  {booking.customerMeta.gatewayStatus === 'settled'
                    ? 'تسوية مقفلة (Settled)'
                    : 'في انتظار التسوية'}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
