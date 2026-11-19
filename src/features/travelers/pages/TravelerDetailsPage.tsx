import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTravelerDetails } from '../hooks/useTravelers';
import { TravelerTripsTab } from '../components/TravelerTripsTab';
import { TravelerSecurityTab } from '../components/TravelerSecurityTab';
import { TravelerKycTab } from '../components/TravelerKycTab';
import { TicketPreviewModal } from '../../bookings/components/TicketPreviewModal';
import { bookingService } from '../../bookings/services/bookingService';
import type { Booking } from '../../bookings/types/booking';

type ActiveTab = 'trips' | 'security' | 'kyc' | 'overview';

export const TravelerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const travelerId = id || 'USR-9482';

  const {
    traveler,
    trips,
    sessions,
    securityLogs,
    verifyKyc,
    updateAccountStatus,
    terminateSession,
    addNote,
  } = useTravelerDetails(travelerId);

  const [activeTab, setActiveTab] = useState<ActiveTab>('trips');
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState<Booking | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // If traveler not found
  if (!traveler) {
    return (
      <div className="w-full min-h-screen bg-surface p-6 font-body-md text-text-primary flex flex-col items-center justify-center gap-4" dir="rtl">
        <span className="material-symbols-outlined text-[48px] text-text-muted">person_off</span>
        <h2 className="text-xl font-bold text-text-primary">لم يتم العثور على ملف المسافر</h2>
        <p className="text-sm text-text-muted">المعرف المطلوب ({travelerId}) غير مسجل في النظام.</p>
        <Link
          to="/travelers"
          className="px-4 py-2 bg-primary-dark text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
        >
          العودة لدليل المسافرين
        </Link>
      </div>
    );
  }

  const handleOpenTicketPreview = async (bookingRef: string) => {
    const booking = await bookingService.getBookingById(bookingRef);
    if (booking) {
      setSelectedBookingForTicket(booking);
      setIsTicketModalOpen(true);
    } else {
      // Fallback: look for standard booking ZL-854921
      const defaultBooking = await bookingService.getBookingById('ZL-854921');
      if (defaultBooking) {
        setSelectedBookingForTicket(defaultBooking);
        setIsTicketModalOpen(true);
      }
    }
  };

  const handlePrintRecord = () => {
    window.print();
  };

  const isVerified = traveler.verificationStatus === 'verified';
  const isSuspended = traveler.accountStatus === 'suspended';

  return (
    <div className="w-full min-h-screen bg-surface p-6 font-body-md text-text-primary" dir="rtl">
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center gap-2 text-text-muted text-xs">
            <Link to="/travelers" className="hover:text-primary-dark transition-colors">
              حسابات المسافرين
            </Link>
            <span className="material-symbols-outlined text-[14px]">arrow_back_ios</span>
            <span className="text-text-primary font-medium">
              {traveler.fullName} ({traveler.id})
            </span>
            <span className="material-symbols-outlined text-[14px]">arrow_back_ios</span>
            <span className="text-primary-dark font-bold">
              {activeTab === 'trips'
                ? 'سجل الرحلات والتذاكر'
                : activeTab === 'security'
                ? 'أمان الحساب والتدقيق'
                : activeTab === 'kyc'
                ? 'بيانات الهوية والتحقق'
                : 'نظرة عامة'}
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-emerald-950">
              {activeTab === 'trips'
                ? 'سجل رحلات وتذاكر المسافر'
                : activeTab === 'security'
                ? 'أمان وجلسات المسافر'
                : activeTab === 'kyc'
                ? 'بيانات الهوية والتحقق الشخصي'
                : 'الملف التعريفي للمسافر'}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isSuspended
                  ? 'bg-red-100 text-red-800'
                  : isVerified
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isSuspended ? 'حساب معلق' : isVerified ? 'حساب موثق' : 'قيد المراجعة'}
            </span>
          </div>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrintRecord}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-surface-subtle border border-border rounded-lg text-primary-dark text-xs font-semibold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>طباعة السجل الشامل</span>
          </button>

          <Link
            to="/bookings"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary-dark hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
            <span>إصدار حجز يدوي للمسافر</span>
          </Link>
        </div>
      </div>

      {/* Profile Header Summary Banner (Deep Institutional Emerald Tone) */}
      <div className="relative overflow-hidden rounded-xl bg-[#0E5C3E] text-white shadow-md mb-6">
        {/* Glow accents */}
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-emerald-600/30 blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-80 h-32 bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="relative p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Passenger Identity Info */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl bg-emerald-100 text-[#0E5C3E] flex items-center justify-center text-2xl font-bold shadow-inner shrink-0">
              {traveler.avatarText}
              {isVerified && (
                <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-[#0E5C3E] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl font-bold text-white">{traveler.fullName}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 text-xs font-mono font-bold tracking-wider">
                  {traveler.id}
                </span>
                {traveler.loyaltyTier === 'platinum' && (
                  <span className="flex items-center gap-1 text-emerald-200 text-xs font-semibold bg-emerald-900/60 px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[16px] text-amber-300">
                      stars
                    </span>
                    عضو بلاتيني
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-emerald-100 text-xs">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-300">
                    phone
                  </span>
                  <span dir="ltr">{traveler.phone}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-300">
                    mail
                  </span>
                  <span>{traveler.email}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-300">
                    badge
                  </span>
                  <span>الرقم الوطني: {traveler.maskedNationalId}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats in Banner */}
          <div className="flex items-stretch gap-2 bg-black/20 p-2 rounded-xl backdrop-blur-sm">
            <div className="px-4 py-1.5 flex flex-col justify-center border-l border-white/10">
              <span className="text-xs text-emerald-200">إجمالي الرحلات</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white tabular-nums">
                  {traveler.totalTrips}
                </span>
                <span className="text-xs text-emerald-200">رحلة</span>
              </div>
            </div>
            <div className="px-4 py-1.5 flex flex-col justify-center border-l border-white/10">
              <span className="text-xs text-emerald-200">إجمالي الإنفاق</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-emerald-300 tabular-nums">
                  {traveler.totalSpendSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-300">ج.س</span>
              </div>
            </div>
            <div className="px-4 py-1.5 flex flex-col justify-center">
              <span className="text-xs text-emerald-200">رصيد المحفظة</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white tabular-nums">
                  {traveler.walletBalanceSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-200">ج.س</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs on Header */}
        <div className="flex items-center gap-1 px-6 bg-emerald-950/40 border-t border-white/10 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('trips')}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'trips'
                ? 'text-emerald-300 border-emerald-300 bg-white/5 font-bold'
                : 'text-emerald-100 hover:text-white border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">airplane_ticket</span>
            <span>سجل الرحلات والتذاكر</span>
            <span className="w-5 h-5 rounded-full bg-emerald-300 text-emerald-950 text-[11px] font-bold flex items-center justify-center">
              {trips.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'security'
                ? 'text-emerald-300 border-emerald-300 bg-white/5 font-bold'
                : 'text-emerald-100 hover:text-white border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">security</span>
            <span>أمان الحساب والتدقيق</span>
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center">
              {sessions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'kyc'
                ? 'text-emerald-300 border-emerald-300 bg-white/5 font-bold'
                : 'text-emerald-100 hover:text-white border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>بيانات الهوية والتحقق الشخصي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'overview'
                ? 'text-emerald-300 border-emerald-300 bg-white/5 font-bold'
                : 'text-emerald-100 hover:text-white border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            <span>نظرة عامة</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'trips' && (
        <TravelerTripsTab
          traveler={traveler}
          trips={trips}
          onOpenTicketPreview={handleOpenTicketPreview}
        />
      )}

      {activeTab === 'security' && (
        <TravelerSecurityTab
          traveler={traveler}
          sessions={sessions}
          securityLogs={securityLogs}
          onTerminateSession={terminateSession}
          onUpdateStatus={updateAccountStatus}
        />
      )}

      {activeTab === 'kyc' && (
        <TravelerKycTab
          traveler={traveler}
          onVerifyKyc={verifyKyc}
          onAddNote={addNote}
        />
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-border shadow-xs flex flex-col gap-3">
            <span className="text-xs font-bold text-primary-dark">ملخص الحساب</span>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">تاريخ التسجيل:</span>
                <span className="font-semibold">{traveler.registrationDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">المدينة الرئيسية:</span>
                <span className="font-semibold">{traveler.mainCity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">فئة الولاء:</span>
                <span className="font-bold text-amber-700">
                  {traveler.loyaltyTier === 'platinum' ? 'عضو بلاتيني' : 'عضو ذهبي'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">الحالة:</span>
                <span className="font-bold text-emerald-700">نشط وموثق</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-border shadow-xs flex flex-col gap-3">
            <span className="text-xs font-bold text-primary-dark">المحفظة والإنفاق</span>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">رصيد المحفظة الحالي:</span>
                <span className="font-bold text-primary-dark tabular-nums">
                  {traveler.walletBalanceSdg.toFixed(2)} ج.س
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">إجمالي الإنفاق:</span>
                <span className="font-bold text-text-primary tabular-nums">
                  {traveler.totalSpendSdg.toFixed(2)} ج.س
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">نقاط المكافأة المتاحة:</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {traveler.rewardPoints} نقطة
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-border shadow-xs flex flex-col gap-3">
            <span className="text-xs font-bold text-primary-dark">روابط سريعة</span>
            <div className="flex flex-col gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('trips')}
                className="w-full text-right p-2.5 rounded-lg bg-surface-subtle hover:bg-emerald-50 text-primary-dark font-semibold transition-colors flex items-center justify-between"
              >
                <span>استعراض تذاكر ورحلات المسافر</span>
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="w-full text-right p-2.5 rounded-lg bg-surface-subtle hover:bg-emerald-50 text-primary-dark font-semibold transition-colors flex items-center justify-between"
              >
                <span>إدارة أجهزة تسجيل الدخول والجلسات</span>
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('kyc')}
                className="w-full text-right p-2.5 rounded-lg bg-surface-subtle hover:bg-emerald-50 text-primary-dark font-semibold transition-colors flex items-center justify-between"
              >
                <span>فحص وثائق الهوية والمرافقين</span>
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Preview Modal with Thermal Receipt Printer Integration */}
      {selectedBookingForTicket && (
        <TicketPreviewModal
          booking={selectedBookingForTicket}
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
        />
      )}
    </div>
  );
};
