import * as React from 'react';
import type { Booking, IssuedTicket } from '../types/booking';
import {
  ReceiptPrinter,
  type ReceiptPrinterStage,
  type ReceiptFeedMotion,
} from '../../../components/shared/ReceiptPrinter';
import { TactileButton } from '../../../components/shared/TactileButton';
import { ThermalTicketPaper } from './ThermalTicketPaper';
import { printTicketElement } from '../../../lib/printTicket';

interface TicketPreviewModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  selectedTicketIndex?: number;
}

export const TicketPreviewModal: React.FC<TicketPreviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  selectedTicketIndex = 0,
}) => {
  const [userSelectedIdx, setUserSelectedIdx] = React.useState<number | null>(null);
  const activeTicketIdx = userSelectedIdx !== null ? userSelectedIdx : selectedTicketIndex;

  // Single-run stage management: starts at 'printing' when modal opens, finishes to 'complete'
  const [stage, setStage] = React.useState<ReceiptPrinterStage>('printing');
  const [feedMotion, setFeedMotion] = React.useState<ReceiptFeedMotion>('stepped');
  // Start printing once per modal open; reset the ticket selection on close
  // (adjusted during render instead of in an effect).
  const [wasOpen, setWasOpen] = React.useState(false);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setStage('printing');
    } else {
      setUserSelectedIdx(null);
    }
  }

  if (!isOpen) return null;

  const ticket: IssuedTicket | undefined = booking.tickets[activeTicketIdx] || booking.tickets[0];

  // Callback when paper feed animation completes exactly once
  const handlePrintFinished = () => {
    setStage('complete');
  };

  // Re-run printing animation only on user explicit click
  const handleReplayPrint = () => {
    if (stage === 'printing') return;
    setStage('processing');
    setTimeout(() => {
      setStage('printing');
    }, 250);
  };

  const handleSelectTicket = (idx: number) => {
    if (idx === activeTicketIdx) return;
    setUserSelectedIdx(idx);
    setStage('processing');
    setTimeout(() => {
      setStage('printing');
    }, 200);
  };

  const handlePrint = () => {
    printTicketElement('printable-ticket');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 w-full max-w-xl max-h-[94vh] overflow-y-auto flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="p-4 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/90 rounded-t-3xl sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">print</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>طابعة التذاكر الحرارية</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-700">
                  80mm Thermal
                </span>
              </h3>
              <span className="text-[11px] text-zinc-400">
                الحجز: {booking.id} • {booking.tickets.length || 1} تذكرة
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TactileButton depth="shallow" size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_2px_0_#065f46]">
              <span className="material-symbols-outlined text-base">print</span>
              <span>طباعة / PDF</span>
            </TactileButton>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Multi-Passenger Selector if booking has multiple tickets */}
        {booking.tickets.length > 1 && (
          <div className="px-6 py-2.5 flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/60 overflow-x-auto">
            <span className="text-xs text-zinc-400 font-medium shrink-0 ml-1">تذاكر المسافرين:</span>
            {booking.tickets.map((t, idx) => (
              <button
                key={t.ticketNumber}
                type="button"
                onClick={() => handleSelectTicket(idx)}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTicketIdx === idx
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span>{t.passengerName}</span>
                <span className="text-[10px] font-mono text-emerald-400">({t.seatNumber})</span>
              </button>
            ))}
          </div>
        )}

        {/* Controls Toolbar: Replay & Feed Motion Switch */}
        <div className="px-6 py-2 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <TactileButton
              depth="shallow"
              size="sm"
              onClick={handleReplayPrint}
              disabled={stage === 'printing'}
            >
              <span className="material-symbols-outlined text-sm">replay</span>
              <span>إعادة محاكاة الطباعة</span>
            </TactileButton>

            <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => setFeedMotion('stepped')}
                className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                  feedMotion === 'stepped'
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                تكة تكة
              </button>
              <button
                type="button"
                onClick={() => setFeedMotion('smooth')}
                className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                  feedMotion === 'smooth'
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                تغذية ناعمة
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                stage === 'complete'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="text-[11px] text-zinc-400">
              {stage === 'complete' ? 'التذكرة جاهزة' : 'جاري إخراج التذكرة...'}
            </span>
          </div>
        </div>

        {/* Physical Printer Machine & Ejection Stage */}
        <div className="p-3 sm:p-5 pt-3 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900/80 to-zinc-950">
          <ReceiptPrinter.Root
            stage={stage}
            feedMotion={feedMotion}
            animate={true}
            onPrintComplete={handlePrintFinished}
            className="w-full max-w-sm"
          >
            {/* Top Physical Printer Body */}
            <ReceiptPrinter.Machine className="w-full">
              {/* Header: Logo + Tactile Button matching reference */}
              <ReceiptPrinter.Header>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-zinc-950 border border-zinc-700/60 flex items-center justify-center p-0.5">
                    <img src="/log-zool-bw.svg" alt="ZoolGo" className="max-h-full max-w-full object-contain filter invert" />
                  </div>
                  <span className="text-[11px] font-mono tracking-wider text-zinc-300 font-bold">
                    ZoolGo THERMAL-80
                  </span>
                </div>
                <TactileButton depth="shallow" size="sm" onClick={handlePrint} className="text-[10px] py-0.5 px-2">
                  طباعة
                </TactileButton>
              </ReceiptPrinter.Header>

              {/* LCD / OLED Screen showing trip and stage */}
              <ReceiptPrinter.Screen>
                <div className="space-y-3 font-sans">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{booking.carrierName || 'ZoolGo Express'}</p>
                      <p className="text-[10px] text-zinc-400">{booking.routeName}</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {booking.totalAmount} ج.س
                    </span>
                  </div>
                  <div className="border-t border-zinc-800/80 pt-2">
                    <ReceiptPrinter.Status />
                  </div>
                </div>
              </ReceiptPrinter.Screen>
            </ReceiptPrinter.Machine>

            {/* Paper Output Slot & Animated Ejection */}
            <ReceiptPrinter.Output className="w-[calc(100%-1rem)]">
              <ReceiptPrinter.Paper>
                {ticket ? (
                  <div id="printable-ticket">
                    <ThermalTicketPaper
                      booking={booking}
                      ticketIndex={activeTicketIdx}
                      onBack={onClose}
                      showLogo={true}
                    />
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500">
                    <p className="text-xs font-semibold">لا توجد بيانات تذكرة متاحة.</p>
                  </div>
                )}
              </ReceiptPrinter.Paper>
            </ReceiptPrinter.Output>
          </ReceiptPrinter.Root>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-zinc-800/80 flex items-center justify-between bg-zinc-950 rounded-b-3xl">
          <span className="text-[11px] text-zinc-400">
            منظومة ZoolGo الذكية لإدارة النقل البري • طباعة التذاكر
          </span>
          <div className="flex items-center gap-2">
            <TactileButton depth="shallow" size="sm" onClick={onClose}>
              إغلاق
            </TactileButton>
          </div>
        </div>
      </div>
    </div>
  );
};
