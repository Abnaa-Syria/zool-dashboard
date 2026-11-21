import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Booking, IssuedTicket } from '../types/booking';

interface ThermalTicketPaperProps {
  booking: Booking;
  ticketIndex?: number;
  onBack?: () => void;
  showLogo?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Thermal barcode visual. NOTE: the bars are decorative and do NOT encode `value` yet;
 * replace with a real Code128 renderer when tickets come from the API (MASTER_PLAN phase 4).
 */
function ThermalBarcodeSVG({ value }: { value: string }) {
  const barSegments = React.useMemo(() => {
    return [
      { w: 2.5, gap: 2.2 },
      { w: 1.2, gap: 1.5 },
      { w: 2.8, gap: 2.8 },
      { w: 3.5, gap: 1.8 },
      { w: 1.5, gap: 1.5 },
      { w: 3.0, gap: 2.5 },
      { w: 2.0, gap: 1.5 },
      { w: 1.5, gap: 2.0 },
      { w: 4.0, gap: 2.8 },
      { w: 2.0, gap: 1.6 },
      { w: 3.5, gap: 2.0 },
      { w: 1.8, gap: 1.4 },
      { w: 2.5, gap: 2.6 },
      { w: 1.2, gap: 1.8 },
      { w: 4.0, gap: 2.2 },
      { w: 2.2, gap: 1.6 },
      { w: 1.5, gap: 2.0 },
      { w: 3.2, gap: 2.8 },
      { w: 2.5, gap: 1.8 },
      { w: 1.8, gap: 1.4 },
      { w: 3.8, gap: 2.2 },
      { w: 2.0, gap: 1.8 },
      { w: 1.5, gap: 1.4 },
      { w: 3.0, gap: 3.2 },
      { w: 4.2, gap: 2.0 },
      { w: 2.0, gap: 1.6 },
      { w: 1.5, gap: 1.8 },
      { w: 3.5, gap: 2.2 },
      { w: 2.2, gap: 1.4 },
      { w: 3.0, gap: 1.8 },
    ];
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full px-2 py-1">
      <svg
        viewBox="0 0 250 80"
        className="w-full h-20 max-w-[270px]"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Barcode ${value}`}
      >
        {(() => {
          let currentX = 8;
          return barSegments.map((segment, idx) => {
            const x = currentX;
            currentX += segment.w + segment.gap * 2.2;
            return (
              <rect
                key={idx}
                x={x}
                y={0}
                width={segment.w * 1.5}
                height={80}
                fill="#000000"
              />
            );
          });
        })()}
      </svg>
    </div>
  );
}

export const ThermalTicketPaper: React.FC<ThermalTicketPaperProps> = ({
  booking,
  ticketIndex = 0,
  onBack,
  showLogo = true,
  className = '',
  style,
}) => {
  const [codeType, setCodeType] = React.useState<'barcode' | 'qr'>('barcode');
  const ticket: IssuedTicket | undefined = booking.tickets[ticketIndex] || booking.tickets[0];
  const passenger =
    booking.passengers.find((p) => p.ticketNumber === ticket?.ticketNumber) ||
    booking.passengers[ticketIndex] ||
    booking.passengers[0];

  // Route extraction: e.g. 'الدمام ← جدة' or 'الخرطوم ← مروي'
  const routeParts = React.useMemo(() => {
    if (booking.routeName.includes('←')) {
      return booking.routeName.split('←').map((s) => s.trim());
    }
    if (booking.routeName.includes('->')) {
      return booking.routeName.split('->').map((s) => s.trim());
    }
    if (booking.routeName.includes(' - ')) {
      return booking.routeName.split(' - ').map((s) => s.trim());
    }
    return [
      booking.originTerminal.split('—')[0].trim() || 'الدمام',
      booking.destinationTerminal.split('—')[0].trim() || 'جدة',
    ];
  }, [booking.routeName, booking.originTerminal, booking.destinationTerminal]);

  const originCity = routeParts[0] || 'الدمام';
  const destinationCity = routeParts[1] || 'جدة';

  // Duration formatting (e.g. '5س 30د')
  const durationFormatted = React.useMemo(() => {
    const raw = booking.travelDurationHours || '5 ساعات و 30 دقيقة';
    if (raw.includes('ساع') && raw.includes('دقيق')) {
      const hours = raw.match(/(\d+)\s*ساع/)?.[1] || '5';
      const mins = raw.match(/(\d+)\s*دقيق/)?.[1] || '30';
      return `${hours}س ${mins}د`;
    }
    return '5س 30د';
  }, [booking.travelDurationHours]);

  // Clean times
  const cleanDepartureTime = (booking.departureTime || '08:30').replace(/\s*(ص|م)/, '').trim();
  const cleanArrivalTime = (booking.estimatedArrivalTime || '13:45').replace(/\s*(ص|م)/, '').trim();

  // Reference number: 'ZL-854921'
  const displayReference = ticket?.ticketNumber
    ? ticket.ticketNumber.replace(/-TKT/, '').split('-').slice(0, 2).join('-')
    : booking.id || 'ZL-854921';

  // Format date: '18 يوليو 2025'
  const displayDate = React.useMemo(() => {
    if (!booking.departureDate) return '18 يوليو 2025';
    if (booking.departureDate.includes('يوليو') || booking.departureDate.includes('أكتوبر') || booking.departureDate.includes('نوفمبر')) {
      return booking.departureDate;
    }
    const dateObj = new Date(booking.departureDate);
    if (!isNaN(dateObj.getTime())) {
      return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(dateObj);
    }
    return booking.departureDate;
  }, [booking.departureDate]);

  return (
    <div
      className={`w-full max-w-sm mx-auto bg-white text-slate-900 select-none font-sans ${className}`}
      style={style}
      dir="rtl"
    >
      {/* 1. Header: Back Arrow & "تذكرتي الرقمية" matching reference image */}
      <div className="relative flex items-center justify-center pb-2 pt-0 mb-1">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-sans text-center">
          تذكرتي الرقمية
        </h2>
        <div className="absolute left-0 no-print">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="p-1 rounded-full text-slate-700 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
              title="رجوع"
            >
              <span className="material-symbols-outlined text-2xl leading-none">arrow_forward</span>
            </button>
          ) : (
            <span className="material-symbols-outlined text-2xl leading-none text-slate-700">
              arrow_forward
            </span>
          )}
        </div>
      </div>

      {/* 2. Pure Black & White Company Logo */}
      {showLogo && (
        <div className="flex flex-col items-center justify-center pt-0 pb-3">
          <div className="w-14 h-9 flex items-center justify-center p-0.5">
            <img
              src="/log-zool-bw.svg"
              alt="شعار الشركة ZoolGo"
              className="max-h-full max-w-full object-contain filter contrast-200 grayscale"
            />
          </div>
          <span className="text-[10px] font-bold tracking-wider text-black mt-0.5 uppercase font-mono">
            {booking.carrierName || 'ZOOLGO EXPRESS'}
          </span>
          <span className="text-[8.5px] text-slate-400 font-medium font-sans">
            تذكرة صعود إلكترونية معتمدة
          </span>
        </div>
      )}

      {/* 3. Reference Code & Status Pill (ZL-854921 & مؤكد) */}
      <div className="flex items-center justify-between pt-1 pb-4">
        {/* Reference Code (Right side in RTL) */}
        <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
          {displayReference}
        </span>

        {/* Soft mint status pill (Left side in RTL) */}
        <div className="flex items-center bg-[#e8f5e9] text-[#1b5e20] px-3 py-0.5 rounded-full text-xs font-bold font-sans">
          <span>مؤكد</span>
        </div>
      </div>

      {/* 4. Schedule & Route Banner */}
      <div className="pt-0 pb-3">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {/* Departure (Right side in RTL) */}
          <div className="flex flex-col items-start min-w-[65px]">
            <span className="text-xl font-extrabold text-[#00875a] font-mono leading-none">
              {cleanDepartureTime}
            </span>
            <span className="text-sm font-bold text-slate-900 mt-1 font-sans">
              {originCity}
            </span>
            <span className="text-[11px] text-slate-400 font-medium font-sans">المغادرة</span>
          </div>

          {/* Dotted Connecting Line with Duration & Direct Badge */}
          <div className="flex-1 flex flex-col items-center px-1">
            <span className="text-[11px] text-slate-400 font-medium mb-1 font-sans">
              {durationFormatted}
            </span>
            <div className="w-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00875a] shrink-0" />
              <div className="flex-1 border-t-2 border-dotted border-slate-300 h-0" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 font-sans">مباشر</span>
          </div>

          {/* Arrival (Left side in RTL) */}
          <div className="flex flex-col items-end min-w-[65px]">
            <span className="text-xl font-extrabold text-slate-900 font-mono leading-none">
              {cleanArrivalTime}
            </span>
            <span className="text-sm font-bold text-slate-900 mt-1 font-sans">
              {destinationCity}
            </span>
            <span className="text-[11px] text-slate-400 font-medium font-sans">الوصول</span>
          </div>
        </div>
      </div>

      {/* 5. Details 2-Column Key-Value Grid matching reference screenshot */}
      <div className="space-y-2.5 pt-0 pb-3 text-xs font-sans">
        {/* Row 1: المسافر & المقعد */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start text-right">
            <span className="text-[11px] text-slate-400 font-medium">المسافر</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 truncate max-w-[140px]">
              {ticket?.passengerName || passenger?.name || booking.mainPassengerName || 'محمد أحمد'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium">المقعد</span>
            <span className="text-sm font-extrabold font-mono text-slate-900 mt-0.5">
              {ticket?.seatNumber || passenger?.seatNumber || 'A12'}
            </span>
          </div>
        </div>

        {/* Row 2: رقم الرحلة & الدرجة */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start text-right">
            <span className="text-[11px] text-slate-400 font-medium">رقم الرحلة</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {booking.tripId || 'EDT-4821'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium">الدرجة</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {ticket?.seatClass === 'vip' || booking.carrierServiceClass.includes('VIP')
                ? 'VIP'
                : 'عادية'}
            </span>
          </div>
        </div>

        {/* Row 3: التاريخ & الشركة */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start text-right">
            <span className="text-[11px] text-slate-400 font-medium">التاريخ</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5">
              {displayDate}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium">الشركة</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 truncate max-w-[130px]">
              {booking.carrierName || 'ايست دلتا'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Perforated Tear Line */}
      <div className="relative my-2.5 flex items-center justify-center">
        <div className="w-full border-b-2 border-dashed border-slate-300" />
      </div>

      {/* 7. Instruction Label */}
      <div className="text-center pt-0 pb-1.5">
        <p className="text-xs text-slate-500 font-medium font-sans">
          اعرض هذا الرمز عند الصعود إلى الباص
        </p>
      </div>

      {/* 8. Thermal Barcode Section */}
      <div className="flex flex-col items-center justify-center pt-0 pb-1">
        {codeType === 'barcode' ? (
          <ThermalBarcodeSVG value={ticket?.barcode || displayReference} />
        ) : (
          <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs">
            <QRCodeSVG
              value={ticket?.qrPayload || `https://zoolgo.com/verify/${displayReference}`}
              size={110}
              level="M"
              includeMargin={false}
            />
          </div>
        )}

        {/* Barcode toggle & reference */}
        <div className="flex items-center justify-between w-full mt-1 px-2 text-[10px] text-slate-400">
          <span className="font-mono">{ticket?.barcode || `${displayReference}-BARCODE`}</span>
          <button
            type="button"
            onClick={() => setCodeType((prev) => (prev === 'barcode' ? 'qr' : 'barcode'))}
            className="text-[10px] text-slate-500 hover:text-black font-sans underline cursor-pointer no-print"
          >
            {codeType === 'barcode' ? 'عرض رمز QR' : 'عرض الباركود'}
          </button>
        </div>
      </div>
    </div>
  );
};
