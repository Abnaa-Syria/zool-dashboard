import * as React from 'react';
import { Link } from 'react-router-dom';
import type { TransportCarrier } from '../types/carrier';

interface CarrierOverviewTabProps {
  carrier: TransportCarrier;
  onSelectTab: (tabId: 'routes' | 'brokers') => void;
}

export const CarrierOverviewTab: React.FC<CarrierOverviewTabProps> = ({
  carrier,
  onSelectTab,
}) => {
  return (
    <div className="space-y-6">
      {/* 6 Bento Operational Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#003B27] text-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-200">
            <span className="text-xs font-semibold">المسارات المنتظمة</span>
            <span className="material-symbols-outlined text-[20px]">route</span>
          </div>
          <div className="py-2">
            <div className="font-mono text-2xl font-bold">{carrier.totalRoutesCount}</div>
            <span className="text-[11px] text-emerald-300">مساراً معتمداً للرحلات</span>
          </div>
          <div className="bg-[#1A533C] rounded-lg p-1.5 text-[11px] flex items-center justify-between">
            <span className="text-emerald-100">التغطية التشغيلية</span>
            <span className="text-emerald-300 font-bold">100% نشط</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">الرحلات المجدولة اليوم</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
            </div>
          </div>
          <div className="py-2">
            <div className="font-mono text-2xl font-bold text-slate-900">32</div>
            <span className="text-[11px] text-emerald-600 font-medium">مجدولة ومؤكدة الإقلاع</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '87.5%' }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">الرحلات الجارية لحظياً</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">directions_bus</span>
            </div>
          </div>
          <div className="py-2">
            <div className="flex items-baseline gap-2">
              <div className="font-mono text-2xl font-bold text-slate-900">
                {carrier.activeTripsNowCount}
              </div>
              <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                على الطريق
              </span>
            </div>
            <span className="text-[11px] text-slate-500">من أصل 32 رحلة اليوم</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
            <span>4 رحلات تصعيد</span>
            <span className="text-slate-700 font-semibold">بالموانئ</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">الأسطول الإجمالي</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <span className="material-symbols-outlined text-[18px]">garage_door</span>
            </div>
          </div>
          <div className="py-2">
            <div className="font-mono text-2xl font-bold text-slate-900">
              {carrier.totalFleetCount}
            </div>
            <span className="text-[11px] text-slate-500">حافلة مسجلة بالنظام</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {carrier.serviceClasses.join(', ')}
          </p>
        </div>

        {/* Metric 5 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">الحافلات المتصلة (GPS)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
            </div>
          </div>
          <div className="py-2">
            <div className="flex items-baseline gap-2">
              <div className="font-mono text-2xl font-bold text-emerald-700">
                {carrier.activeGpsBusesCount}
              </div>
              <span className="text-xs font-bold text-emerald-700">
                {Math.round((carrier.activeGpsBusesCount / carrier.totalFleetCount) * 100)}%
              </span>
            </div>
            <span className="text-[11px] text-slate-500">بث فوري عبر الأقمار</span>
          </div>
          <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-1.5">
            <span className="text-slate-500">
              {carrier.totalFleetCount - carrier.activeGpsBusesCount} حافلات صيانة
            </span>
            <span className="text-amber-600 font-semibold">غير نشط</span>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">حجوزات (30 يوماً)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-[#8E1B32]">
              <span className="material-symbols-outlined text-[18px]">local_activity</span>
            </div>
          </div>
          <div className="py-2">
            <div className="font-mono text-2xl font-bold text-[#8E1B32]">8,420</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +14.8% مقارنة بالشهر السابق
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
            <span>متوسط الإشغال: 91.2%</span>
            <span className="text-emerald-700 font-bold">ممتاز</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION A: Regulatory & Licensing Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#003B27] rounded-full" />
                <h2 className="text-sm font-bold text-slate-900">
                  البيانات الأساسية ومعلومات الاعتماد المعتمدة
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                رمز المنظومة: {carrier.code}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[14px]">corporate_fare</span>
                  الاسم التجاري المعتمد
                </span>
                <span className="text-xs font-bold text-slate-900">{carrier.name}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[14px]">gavel</span>
                  الاسم القانوني المسجل رسمياً
                </span>
                <span className="text-xs font-bold text-slate-900">{carrier.commercialName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[14px]">badge</span>
                  رقم السجل التجاري (CRN)
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {carrier.commercialRegistrationNumber}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                  الرقم التعريفي الضريبي (TIN)
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {carrier.taxIdentificationNumber}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  وثيقة ترخيص النقل البري
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {carrier.transportLicenseDoc}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  تاريخ سريان الترخيص
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-900">
                    حتى {carrier.licenseExpiryDate}
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    سارٍ
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  مقر الإدارة العامة
                </span>
                <span className="text-xs text-slate-900">
                  {carrier.headOfficeAddress} ({carrier.city} — {carrier.state})
                </span>
              </div>
            </div>
          </div>

          {/* SECTION B: Contact Persons */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <span className="w-1.5 h-5 bg-emerald-700 rounded-full" />
              <h2 className="text-sm font-bold text-slate-900">
                مسؤولو الاتصال والتشغيل المفوضون
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carrier.contacts.map((contact, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    contact.isPrimary
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {contact.name.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{contact.name}</h4>
                        <span className="text-[11px] text-slate-500">{contact.role}</span>
                      </div>
                    </div>
                    {contact.isPrimary && (
                      <span className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        المفوض الرئيسي
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-[11px] text-slate-400">الهاتف:</span>
                      <span className="font-mono text-slate-800" dir="ltr">
                        {contact.phone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-[11px] text-slate-400">البريد:</span>
                      <span className="font-mono text-slate-800" dir="ltr">
                        {contact.email}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION C: Broker Relationship & Governance Note */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#8E1B32] rounded-full" />
                <h2 className="text-sm font-bold text-slate-900">
                  حوكمة علاقة مكاتب الوسطاء والعمولات
                </h2>
              </div>
              <button
                onClick={() => onSelectTab('brokers')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>إدارة الوسطاء والعمولات</span>
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">المكاتب المعيّنة</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-bold text-slate-900">
                    {carrier.linkedBrokersCount}
                  </span>
                  <span className="text-xs text-slate-500">مكتب وسيط</span>
                </div>
                <span className="text-[11px] text-emerald-700 mt-1 block">
                  موزعون عبر 5 ولايات
                </span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <span className="text-xs text-emerald-800 block mb-1">
                  نسبة عمولة الوكلاء المطبقة
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-bold text-emerald-700">10.0%</span>
                  <span className="text-xs text-emerald-700">لكل تذكرة</span>
                </div>
                <span className="text-[11px] text-emerald-600 mt-1 block">
                  تُخصم آلياً عند إتمام الحجز
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">تاريخ آخر تعديل للعمولة</span>
                <div className="font-mono text-sm font-bold text-slate-800 mt-1">
                  {carrier.commissionHistory[0]?.decisionDate || '01 يوليو 2024'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  بواسطة: إدارة {carrier.name}
                </span>
              </div>
            </div>

            {/* Governance note */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-emerald-700 text-[22px] shrink-0 mt-0.5">
                shield
              </span>
              <div className="text-xs text-emerald-900 space-y-1">
                <div className="font-bold">ملاحظة رقابية وحوكمة المنظومة:</div>
                <p className="leading-relaxed text-emerald-800">
                  تُحدد كل شركة نقل نسبة عمولة وكلائها باستقلالية تامة وفقاً لسياساتها التعاقدية؛ وتُطبّق
                  منصة <strong>ZoolGo</strong> النسبة المعتمدة (10.0%) آلياً عند إصدار الحجوزات عبر الوسطاء
                  المعتمدين، ويتم تقييد المبالغ في المحافظ اللحظية دون أي تدخل يدوي من المشرف العام.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION D: Live Geographic Map Snapshot */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-700 rounded-full" />
                <h2 className="text-sm font-bold text-slate-900">
                  التوزيع الجغرافي للشبكة والأسطول اللحظي
                </h2>
              </div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{carrier.activeTripsNowCount} حافلة متحركة الآن</span>
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-900 min-h-[240px] flex flex-col justify-between p-4 border border-slate-200">
              {/* Background gradient simulating map view */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 50%, #003B27 0%, #0A1F17 100%)',
                }}
              />
              <div className="relative z-10 bg-white/95 backdrop-blur-md p-3 rounded-lg max-w-sm shadow-md text-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px]">
                    navigation
                  </span>
                  <span>الممرات التشغيلية لشركة {carrier.name}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  أعلى كثافة تشغيلية مسجلة حالياً على مسار:{' '}
                  <strong>الخرطوم ↔ عطبرة ↔ مروي ↔ بورتسودان</strong>
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-white/95 backdrop-blur-md text-slate-800 px-3 py-1 rounded-full font-semibold shadow-sm">
                    متوسط السرعة:{' '}
                    <span className="font-mono text-emerald-700 font-bold">82 كم/س</span>
                  </span>
                  <span className="bg-white/95 backdrop-blur-md text-slate-800 px-3 py-1 rounded-full font-semibold shadow-sm">
                    حالة الطرق:{' '}
                    <span className="text-emerald-700 font-bold">آمنة ومفتوحة</span>
                  </span>
                </div>

                <Link
                  to={`/tracking?carrier=${encodeURIComponent(carrier.code)}`}
                  className="bg-[#003B27] hover:bg-[#002B1D] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                  <span>تكبير نظام التتبع الحي للأقمار</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Left Rail Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#8E1B32] rounded-full" />
              <span>إجراءات وانتقال سريع</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => onSelectTab('routes')}
                className="w-full p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl flex items-center justify-between transition-all group text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">alt_route</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">المسارات والمحطات</h4>
                    <span className="text-[11px] text-slate-500">
                      {carrier.totalRoutesCount} مسارات معتمدة
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:-translate-x-1 transition-transform text-[18px]">
                  arrow_back
                </span>
              </button>

              <button
                onClick={() => onSelectTab('routes')}
                className="w-full p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl flex items-center justify-between transition-all group text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">الرحلات والأسطول المباشر</h4>
                    <span className="text-[11px] text-slate-500">
                      {carrier.totalFleetCount} حافلة • {carrier.activeGpsBusesCount} متصلة
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:-translate-x-1 transition-transform text-[18px]">
                  arrow_back
                </span>
              </button>

              <button
                onClick={() => onSelectTab('brokers')}
                className="w-full p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl flex items-center justify-between transition-all group text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">handshake</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">الوسطاء والعمولات</h4>
                    <span className="text-[11px] text-slate-500">
                      {carrier.linkedBrokersCount} مكاتب معتمدة • عمولة 10%
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:-translate-x-1 transition-transform text-[18px]">
                  arrow_back
                </span>
              </button>

              <Link
                to={`/bookings?carrier=${encodeURIComponent(carrier.name)}`}
                className="w-full p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl flex items-center justify-between transition-all group text-right block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-[#8E1B32] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">
                      confirmation_number
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">حجوزات وتذاكر الشركة</h4>
                    <span className="text-[11px] text-slate-500">
                      استعراض الحجوزات الصادرة للركاب
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:-translate-x-1 transition-transform text-[18px]">
                  arrow_back
                </span>
              </Link>
            </div>
          </div>

          {/* Fleet Composition Breakdown */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-700 rounded-full" />
              <span>توزيع أسطول الحافلات</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">VIP Express (مكيف + Wi-Fi)</span>
                  <span className="font-mono text-slate-900 font-bold">28 حافلة (58%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#003B27] h-full rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">درجة أولى ستاندرد</span>
                  <span className="font-mono text-slate-900 font-bold">16 حافلة (33%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '33%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">ميني باص / إقليمي</span>
                  <span className="font-mono text-slate-900 font-bold">4 حافلات (9%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '9%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
