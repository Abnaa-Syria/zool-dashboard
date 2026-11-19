import React from 'react';
import { Link } from 'react-router-dom';
import type { Traveler } from '../types/traveler';

interface TravelerQuickDrawerProps {
  traveler: Traveler | null;
  isOpen: boolean;
  onClose: () => void;
  onSuspendToggle?: (traveler: Traveler) => void;
}

export const TravelerQuickDrawer: React.FC<TravelerQuickDrawerProps> = ({
  traveler,
  isOpen,
  onClose,
  onSuspendToggle,
}) => {
  if (!isOpen || !traveler) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel (from left in RTL layout) */}
      <div className="absolute inset-y-0 left-0 max-w-full flex pl-10 pointer-events-auto">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-r border-border animate-slide-left">
          {/* Drawer Header */}
          <div className="p-6 bg-surface-subtle flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-xs ${
                  traveler.accountStatus === 'suspended'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-[#0E5C3E] text-white'
                }`}
              >
                {traveler.avatarText}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-primary-dark">
                  {traveler.fullName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-muted">{traveler.id}</span>
                  {traveler.loyaltyTier === 'platinum' && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                      عضو بلاتيني
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white transition-colors"
              title="إغلاق"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {/* National ID / Document Card */}
            <div className="p-4 rounded-xl bg-surface-subtle border border-border flex flex-col gap-2">
              <span className="text-xs font-bold text-primary-dark">الرقم القومي والتحقق</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-text-primary dir-ltr">
                  {traveler.nationalId}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    traveler.verificationStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : traveler.verificationStatus === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {traveler.verificationStatus === 'verified'
                    ? 'موثق ومعتمد'
                    : traveler.verificationStatus === 'pending'
                    ? 'بانتظار المراجعة'
                    : 'مرفوض'}
                </span>
              </div>
              <span className="text-xs text-text-muted">
                {traveler.verificationProvider || 'السجل المدني الاتحادي'}
              </span>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col">
                <span className="text-xs text-text-muted">رصيد المحفظة الرقمية</span>
                <span className="text-lg font-bold text-primary-dark tabular-nums">
                  {traveler.walletBalanceSdg.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  <span className="text-xs font-normal">ج.س</span>
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col">
                <span className="text-xs text-text-muted">نقاط المكافآت</span>
                <span className="text-lg font-bold text-emerald-700 tabular-nums">
                  {traveler.rewardPoints} <span className="text-xs font-normal">نقطة</span>
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">رقم الهاتف:</span>
                <span className="font-mono font-bold text-text-primary dir-ltr">
                  {traveler.phone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">البريد الإلكتروني:</span>
                <span className="text-text-primary">{traveler.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">محل الإقامة:</span>
                <span className="text-text-primary">{traveler.residenceArea}</span>
              </div>
            </div>

            {/* Active Bookings Banner */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-primary-dark">آخر الحجوزات النشطة</span>
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">
                    ZL-854921 (الخرطوم ⟵ بورتسودان)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                    جارية الآن
                  </span>
                </div>
                <span className="text-xs text-emerald-800">
                  شركة شريان الشمال • مقعد رقم A12 • انطلاق 07:30 ص
                </span>
                <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                  <Link
                    to="/tracking?busId=ZG-BUS-018"
                    className="text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">near_me</span>
                    <span>تتبع الحافلة (ZG-BUS-018)</span>
                  </Link>
                  <Link
                    to="/bookings/ZL-854921"
                    className="text-primary-dark font-semibold hover:underline"
                  >
                    تفاصيل الحجز
                  </Link>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {traveler.emergencyContact && (
              <div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1 text-xs">
                <span className="font-bold text-text-primary">جهة الاتصال للطوارئ</span>
                <div className="flex items-center justify-between">
                  <span>
                    {traveler.emergencyContact.name} ({traveler.emergencyContact.relationship})
                  </span>
                  <span className="font-mono text-primary-dark dir-ltr">
                    {traveler.emergencyContact.phone}
                  </span>
                </div>
              </div>
            )}

            {/* Actions at bottom */}
            <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border">
              <Link
                to={`/travelers/${traveler.id}`}
                className="w-full py-2.5 rounded-lg bg-[#0E5C3E] text-white text-xs font-bold hover:bg-[#0a462f] transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">account_box</span>
                <span>الانتقال للملف الشامل للمسافر</span>
              </Link>

              {onSuspendToggle && (
                <button
                  type="button"
                  onClick={() => onSuspendToggle(traveler)}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 border ${
                    traveler.accountStatus === 'suspended'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-white hover:bg-red-50 text-red-700 border-border hover:border-red-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {traveler.accountStatus === 'suspended' ? 'check_circle' : 'block'}
                  </span>
                  <span>
                    {traveler.accountStatus === 'suspended'
                      ? 'إلغاء تعليق الحساب وتنشيطه'
                      : 'تعليق حساب المسافر مؤقتاً'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
