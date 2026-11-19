import * as React from 'react';
import type { BrokerOffice } from '../types/broker';

interface BrokerOverviewTabProps {
  broker: BrokerOffice;
  onTopUpClick: () => void;
  onSelectTab: (tabId: 'staff' | 'ledger') => void;
}

export const BrokerOverviewTab: React.FC<BrokerOverviewTabProps> = ({
  broker,
  onTopUpClick,
  onSelectTab,
}) => {
  const isLowBalance = broker.isLowBalanceAlert || broker.walletBalance < 500;

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Wallet Available Balance Hero */}
        <div className="bg-[#003B27] text-white p-5 rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-xs font-semibold text-emerald-200 block mb-1">
                رصيد المحفظة الفعلي المتاح
              </span>
              <span className="text-[11px] text-emerald-300">
                الرصيد الجاهز لإصدار التذاكر الفورية
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 flex items-center justify-center text-emerald-200">
              <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
            </div>
          </div>

          <div className="my-4 relative z-10">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-bold tracking-tight">
                {broker.walletBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs text-emerald-300 font-semibold">ج.س</span>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-200 relative z-10">
            <span>حد الأمان الأدنى: 500.00 ج.س</span>
            <span
              className={`font-semibold inline-flex items-center gap-1 ${
                isLowBalance ? 'text-amber-300' : 'text-emerald-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLowBalance ? 'bg-amber-300 animate-ping' : 'bg-emerald-300'
                }`}
              />
              <span>{isLowBalance ? 'يحتاج شحن' : 'آمن ومستقر'}</span>
            </span>
          </div>
        </div>

        {/* Card 2: Unsettled Accrued Commission */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">العمولة التراكمية غير المسواة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">percent</span>
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-emerald-700">
                +{broker.unsettledAccruedCommissionSdg.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs text-slate-400 font-medium">ج.س</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              استحقاقات عمولة بيع التذاكر (دورة {broker.activeSettlementCycle})
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">التسوية الدورية: أسبوعياً</span>
            <button
              onClick={() => onSelectTab('ledger')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              عرض الحركات
            </button>
          </div>
        </div>

        {/* Card 3: Today's Sales */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">مبيعات اليوم الحالية</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-slate-900">
                {broker.todaySalesSdg.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">ج.س</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              عبر {broker.todayTicketsCount} تذكرة صادرة اليوم
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-emerald-700 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check</span>
            <span>كافة الحجوزات مؤكدة فورياً</span>
          </div>
        </div>

        {/* Card 4: Operating Staff & Hardware */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">الموظفون وأجهزة نقاط البيع</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-center gap-3">
              <div>
                <span className="font-mono text-2xl font-bold text-slate-900">
                  {broker.clerksCount}
                </span>
                <span className="text-xs text-slate-500 mr-1">موظفين</span>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="font-mono text-2xl font-bold text-emerald-700">
                  {broker.posCount}
                </span>
                <span className="text-xs text-slate-500 mr-1">أجهزة POS</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              جاهزية تامة لإصدار التذاكر المطبوعة
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium">متصل بالشبكة</span>
            <button
              onClick={() => onSelectTab('staff')}
              className="text-slate-600 hover:text-slate-900 font-semibold"
            >
              إدارة الكادر
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Accreditation Details Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#003B27] rounded-full" />
                <h2 className="text-sm font-bold text-slate-900">
                  بيانات الاعتماد والترخيص الحكومي المعتمد
                </h2>
              </div>
              <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                رمز الوكيل: {broker.code}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-1">
                  رقم ترخيص الوكالة المعتمد
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {broker.licenseNumber}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-1">
                  السجل التجاري الوطني (CRN)
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {broker.commercialRegistrationNumber}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-1">جهة الاعتماد والترخيص</span>
                <span className="text-xs font-semibold text-slate-900">
                  {broker.accreditationAuthority}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-1">سريان الترخيص</span>
                <span className="text-xs font-mono text-slate-900">
                  حتى {broker.licenseExpiryDate}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-1">المدير المسؤول عن المكتب</span>
                <span className="text-xs font-bold text-slate-900">{broker.managerName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-1">هاتف الاتصال بالمدير</span>
                <span className="text-xs font-mono text-slate-900" dir="ltr">
                  {broker.managerPhone}
                </span>
              </div>

              <div className="md:col-span-2 p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-1">
                  العنوان التفصيلي وموقع نقطة البيع
                </span>
                <span className="text-xs text-slate-900">
                  {broker.address} ({broker.city} — {broker.state})
                </span>
              </div>
            </div>
          </div>

          {/* Financial Separation Principles */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-1.5 h-5 bg-[#8E1B32] rounded-full" />
              <h2 className="text-sm font-bold text-slate-900">
                مبدأ الفصل المالي الصارم لمحفظة الوسطاء (Financial Separation Principle)
              </h2>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-emerald-800 text-[22px] shrink-0 mt-0.5">
                account_balance
              </span>
              <div className="text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-slate-900">آلية الخصم والتقييد الآلي:</div>
                <p className="leading-relaxed">
                  1. <strong>رصيد المحفظة المتاح (Float Balance):</strong> يمثل أموالاً مودعة مسبقاً من
                  الوكيل وتُخصم منها قيمة التذاكر لحظياً عند كل حجز جديد لصالح شركة النقل المعنية.
                </p>
                <p className="leading-relaxed">
                  2. <strong>العمولة التراكمية (Accumulated Commissions):</strong> لا تندمج مع الرصيد
                  المتاح تلقائياً، بل يتم تجميعها في حساب استحقاق منفصل لتُسوّى وتُصرَف للوكيل بصورة
                  دورية عبر إشعار رسمي كل دورة أسبوعية.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Rail Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Top-Up Wallet Trigger Card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-700 text-[18px]">
                  bolt
                </span>
                <span>إجراءات المحفظة السريعة</span>
              </h3>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">الرصيد المتاح:</span>
                <span className="font-mono font-bold text-slate-900">
                  {broker.walletBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  ج.س
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">حالة السيولة:</span>
                <span
                  className={`font-semibold ${
                    isLowBalance ? 'text-[#8E1B32]' : 'text-emerald-700'
                  }`}
                >
                  {isLowBalance ? 'حرجة (< 500 ج.س)' : 'كافية ومستقرة'}
                </span>
              </div>
            </div>

            <button
              onClick={onTopUpClick}
              className="w-full py-2.5 bg-[#8E1B32] hover:bg-[#6D001E] text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_card</span>
              <span>شحن فوري للمحفظة الآن</span>
            </button>
          </div>

          {/* POS Hardware Devices Status */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-slate-700 text-[18px]">
                  devices
                </span>
                <span>أجهزة نقاط البيع المعتمدة ({broker.posTerminals.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {broker.posTerminals.map((pos) => (
                <div
                  key={pos.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{pos.id}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        pos.status === 'online'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          pos.status === 'online' ? 'bg-emerald-600' : 'bg-slate-500'
                        }`}
                      />
                      <span>{pos.status === 'online' ? 'متصل فورياً' : 'غير متصل'}</span>
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    <div>الموديل: {pos.model}</div>
                    <div>الموظف المسؤول: {pos.assignedClerkName}</div>
                    <div className="flex items-center justify-between pt-1 text-slate-400">
                      <span>البطارية: {pos.batteryLevelPercent}%</span>
                      <span>آخر مزامنة: {pos.lastSyncAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
