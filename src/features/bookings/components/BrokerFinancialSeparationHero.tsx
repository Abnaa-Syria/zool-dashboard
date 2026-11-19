import * as React from 'react';
import type { Booking } from '../types/booking';

interface BrokerFinancialSeparationHeroProps {
  booking: Booking;
}

export const BrokerFinancialSeparationHero: React.FC<BrokerFinancialSeparationHeroProps> = ({
  booking,
}) => {
  const meta = booking.brokerMeta;
  if (!meta) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Title & Governance Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">balance</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              الفصل المالي الصريح لعمليات الوكلاء والمنصة
            </h2>
            <p className="text-xs text-slate-500">
              حوكمة دقيقة تفصل بين السعر الفعلي للمسافر، الخصم الفوري للمحفظة، والتراكم المؤجل للعمولات
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold w-fit">
          دورة التسوية النشطة: {meta.settlementCycleId}
        </span>
      </div>

      {/* 6 Financial Cards Grid (Matching Stitch _7 exactly!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Card 1: Official Ticket Fare */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">إجمالي قيمة التذكرة</span>
            <span className="material-symbols-outlined text-base text-emerald-700">confirmation_number</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-slate-900">
                {meta.walletDebitAmount.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-emerald-800">ج.س</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">السعر الرسمي المحصّل من المسافر</span>
          </div>
        </div>

        {/* Card 2: Wallet Deducted Amount (MANDATORY: Equal to full ticket face value, never netted) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-100 bg-rose-50/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">الخصم من محفظة الوكيل</span>
            <span className="material-symbols-outlined text-base text-[#8E1B32]">credit_card_off</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-[#8E1B32]">
                -{meta.walletDebitAmount.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-[#8E1B32]">ج.س</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">تم الخصم الكامل وقت تأكيد الحجز</span>
          </div>
        </div>

        {/* Card 3: Instant Wallet Txn Ref */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">مرجع حركة المحفظة</span>
            <span className="material-symbols-outlined text-base text-emerald-700">receipt</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold font-mono text-emerald-900 truncate">
              {meta.walletTransactionRef}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">توقيت القيد: 09:20:14 ص</span>
          </div>
        </div>

        {/* Card 4: Historical Balance Snapshot (Distinct from Current Wallet Balance) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">رصيد المحفظة بعد الخصم</span>
            <span className="material-symbols-outlined text-base text-emerald-700">history</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-slate-900">
                {meta.walletBalanceAfterDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-emerald-800">ج.س</span>
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 font-medium">
              الرصيد الحالي الآن: {meta.walletCurrentBalance.toLocaleString('en-US')} ج.س
            </span>
          </div>
        </div>

        {/* Card 5: Accrued Commission (Logged separately, NEVER netted against debit) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100 bg-emerald-50/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">العمولة المتراكمة المستحقة</span>
            <span className="material-symbols-outlined text-base text-emerald-700">savings</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-emerald-700">
                +{meta.accruedCommissionAmount.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-emerald-700">ج.س</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              نسبة الوكيل {meta.commissionRatePercent}% (قيد التجميع)
            </span>
          </div>
        </div>

        {/* Card 6: Commission Settlement Cycle */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">دورة التسوية المعلقة</span>
            <span className="material-symbols-outlined text-base text-amber-600">hourglass_top</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold font-mono text-slate-900">
              {meta.settlementCycleId}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold mt-1">
              تصفية أسبوعية دورية مجمعة
            </span>
          </div>
        </div>
      </div>

      {/* Governance & Accounting Policy Callout */}
      <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-950">
        <span className="material-symbols-outlined text-emerald-700 text-lg shrink-0">policy</span>
        <p className="leading-relaxed">
          <strong>قاعدة الحوكمة المالية الصريحة:</strong> يتم خصم كامل القيمة الاسمية للتذكرة ({meta.walletDebitAmount.toFixed(2)} ج.س) من محفظة الوكيل الإلكترونية دفعة واحدة عند تأكيد الحجز. لا يجوز خصم العمولة المستحقة (+{meta.accruedCommissionAmount.toFixed(2)} ج.س) مسبقاً من قيمة التذكرة، بل تسجل كبند دائن منفصل في دورة التسوية الأسبوعية {meta.settlementCycleId} لضمان التوافق مع دفاتر الناقل والتدقيق الضريبي.
        </p>
      </div>
    </div>
  );
};
