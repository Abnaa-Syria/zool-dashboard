import React, { useState } from 'react';
import { useCarrierShares } from '../hooks/useReports';
import { CarrierShareBarChart } from '../components/CarrierShareBarChart';

export const CarrierSharesPage: React.FC = () => {
  const { data, loading, error, exportCsv } = useCarrierShares();

  const [period, setPeriod] = useState('q4_2024');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [notificationSent, setNotificationSent] = useState(false);

  if (loading) {
    return (
      <div className="p-space-lg flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="font-body-md text-on-surface-variant">جاري تحميل إحصاءات وحصص شركات النقل...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-space-lg">
        <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-label-lg">
          حدث خطأ أثناء تحميل بيانات شركات النقل.
        </div>
      </div>
    );
  }

  const filteredCarriers = data.carriers.filter((c) => {
    if (carrierFilter === 'vip') return c.rank === 1;
    if (carrierFilter === 'regional') return c.rank >= 2;
    return true;
  });

  const handleSendCycleNotice = () => {
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 4000);
  };

  return (
    <div className="relative w-full overflow-hidden p-space-lg flex flex-col gap-space-lg max-w-[1520px] mx-auto">
      {/* Dynamic Gradient Ambient Backdrop Spot */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-64 right-10 w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none -z-10"></div>

      {/* Breadcrumb Hierarchy */}
      <nav className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md select-none">
        <a className="hover:text-secondary transition-colors cursor-pointer" href="/reports">
          الرئيسية والعمليات
        </a>
        <span className="material-symbols-outlined text-[14px]">chevron_left</span>
        <a className="hover:text-secondary transition-colors cursor-pointer" href="/reports">
          المالية والتسويات
        </a>
        <span className="material-symbols-outlined text-[14px]">chevron_left</span>
        <a className="hover:text-secondary transition-colors cursor-pointer" href="/reports">
          التقارير المالية والإحصاءات
        </a>
        <span className="material-symbols-outlined text-[14px]">chevron_left</span>
        <span className="text-secondary font-bold">أداء شركات النقل وحصص المبيعات</span>
      </nav>

      {/* Notification Toast */}
      {notificationSent && (
        <div className="p-3 bg-secondary text-on-secondary rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-label-lg text-sm">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            تم إرسال إشعارات التسوية البنكية وكشوف الحسابات إلى جميع مديري الحسابات بالشركات بنجاح.
          </div>
          <button onClick={() => setNotificationSent(false)} className="text-on-secondary/80 hover:text-on-secondary">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header & Decisive Control Bar */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
              دورة التسوية الربعية Q4
            </span>
            <span className="text-on-surface-variant font-body-sm text-body-sm">• تدقيق فصلي موثق</span>
          </div>
          <h1 className="font-display-md text-display-md text-on-surface tracking-tight font-bold">
            تقرير أداء شركات النقل وحصص المبيعات
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            تحليل الإيرادات التشغيلية، ومعدلات إشغال الأسطول، وصافي المستحقات التراكمية لكل ناقل معتمد عبر شبكة ZoolGo
          </p>
        </div>

        {/* Action Cluster */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container-high">
            <span className="material-symbols-outlined text-secondary text-[20px]">calendar_month</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent border-none text-on-surface font-label-lg text-label-lg focus:outline-none cursor-pointer"
            >
              <option value="q4_2024">الربع الرابع Q4 2024</option>
              <option value="q3_2024">الربع الثالث Q3 2024</option>
              <option value="fy_2024">السنة المالية 2024 كاملة</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container-high">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">filter_alt</span>
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="bg-transparent border-none text-on-surface font-label-lg text-label-lg focus:outline-none cursor-pointer"
            >
              <option value="all">كافة الشركات (النشطة والمعتمدة)</option>
              <option value="vip">الشركات فئة VIP الممتازة</option>
              <option value="regional">خطوط النقل الإقليمية والدولية</option>
            </select>
          </div>

          <button
            onClick={handleSendCycleNotice}
            className="flex items-center gap-1.5 px-4 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container text-secondary font-label-lg text-label-lg transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
            <span>إشعار دورة الصرف</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-4 h-10 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-lg text-label-lg transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>تصدير كشف حصص الناقلين (Excel)</span>
          </button>
        </div>
      </header>

      {/* Top Key Metrics Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Metric 1: Dark Emerald Hero Card */}
        <div className="bg-secondary text-on-secondary p-space-lg rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-secondary-container/10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-label-md text-label-md text-secondary-container font-semibold">
              إجمالي مبيعات تذاكر الناقلين
            </span>
            <span className="material-symbols-outlined text-secondary-container text-[22px]">payments</span>
          </div>
          <div>
            <div className="font-tabular-stat text-tabular-stat tracking-tight text-on-secondary font-bold">
              {data.totalCarrierSalesSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="font-label-md text-label-md text-secondary-container font-normal">ج.س</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-secondary-container font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              قبل خصم عمولة المنصة وحصص الشركاء
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
              معدل إشغال الأسطول (Load Factor)
            </span>
            <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">airline_seat_recline_extra</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-tabular-stat text-tabular-stat text-on-surface font-bold">
                {data.averageLoadFactorPercent}%
              </span>
              <span className="font-label-md text-label-md text-secondary font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +4.1%
              </span>
            </div>
            <div className="mt-2 text-on-surface-variant font-body-sm text-body-sm">
              إجمالي {data.totalTripsCompleted} رحلة تشغيلية منجزة بنجاح
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
              صافي المستحقات الجاهزة للتحويل
            </span>
            <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </span>
          </div>
          <div>
            <div className="font-tabular-stat text-tabular-stat text-on-surface font-bold">
              {data.totalNetPayableSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">ج.س</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-secondary font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              جاهزة لجدولة التحويل البنكي الفوري
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
              متوسط استقطاع منصة ZoolGo
            </span>
            <span className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">pie_chart</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-tabular-stat text-tabular-stat text-primary-container font-bold">
                {data.avgPlatformTakeRatePercent}%
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                ({data.totalTakeRateSdg.toLocaleString('en-US')} ج.س)
              </span>
            </div>
            <div className="mt-2 text-on-surface-variant font-body-sm text-body-sm">
              شاملة رسوم بوابات الدفع وخدمات السحابة
            </div>
          </div>
        </div>
      </section>

      {/* Operational Market Share Strip */}
      <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm border border-surface-container-high">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              توزيع الحصص السوقية للناقلين (Q4 2024)
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              نسبة مساهمة كل ناقل في حجم الحجوزات الكلية عبر المنصة
            </p>
          </div>
          <div className="flex items-center gap-4 text-body-sm font-body-sm text-on-surface-variant flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-secondary"></span>سابتكو (45.3%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-secondary-fixed-dim"></span>النيل (31.7%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary-container"></span>إيست دلتا (13.3%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></span>شريان الشمال (9.7%)
            </span>
          </div>
        </div>

        {/* Proportional Segment Bar */}
        <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden flex gap-0.5">
          <div
            className="h-full bg-secondary transition-all hover:opacity-90"
            style={{ width: '45.3%' }}
            title="سابتكو: 45.3%"
          ></div>
          <div
            className="h-full bg-secondary-fixed-dim transition-all hover:opacity-90"
            style={{ width: '31.7%' }}
            title="النيل: 31.7%"
          ></div>
          <div
            className="h-full bg-primary-container transition-all hover:opacity-90"
            style={{ width: '13.3%' }}
            title="إيست دلتا: 13.3%"
          ></div>
          <div
            className="h-full bg-tertiary-fixed-dim transition-all hover:opacity-90"
            style={{ width: '9.7%' }}
            title="شريان الشمال: 9.7%"
          ></div>
        </div>
      </section>

      {/* Advanced Recharts Comparative Bar Chart */}
      <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high">
        <div className="mb-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            مقارنة حجم مبيعات التذاكر مقابل صافي المستحق للناقلين
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            رسم بياني تفاعلي يوضح التدفق المالي الإجمالي وصافي المبالغ المحولة بعد اقتطاع عمولة المنصة
          </p>
        </div>
        <CarrierShareBarChart carriers={filteredCarriers} />
      </section>

      {/* Main Carrier Deep Dive Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
        {filteredCarriers.map((carrier) => (
          <div
            key={carrier.carrierId}
            className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden group border border-surface-container-high hover:border-secondary transition-colors"
          >
            <div className="flex flex-col gap-space-md">
              {/* Carrier Header */}
              <div className="flex items-start justify-between pb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center p-2 shadow-inner">
                    <span className="material-symbols-outlined text-secondary text-[32px]">directions_bus</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline-md text-headline-md text-on-surface font-bold">
                        {carrier.carrierName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md font-bold">
                        #{carrier.rank} {carrier.rank === 1 ? 'الأعلى أداءً' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md">
                        {carrier.tier === 'VIP' ? 'ناقل معتمد VIP' : 'ناقل بري معتمد'}
                      </span>
                      <span className="text-on-surface-variant font-body-sm text-body-sm">
                        كود الناقل: {carrier.carrierId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Share Badge */}
                <div className="text-left">
                  <div className="font-headline-lg text-headline-lg text-secondary font-bold">
                    {carrier.marketSharePercent}%
                  </div>
                  <div className="font-label-md text-label-md text-on-surface-variant">الحصة الإجمالية</div>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-2 p-space-sm rounded-lg bg-surface-container-low">
                <div className="text-center">
                  <div className="font-label-md text-label-md text-on-surface-variant">الرحلات المنفذة</div>
                  <div className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {carrier.completedTripsCount}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-label-md text-label-md text-on-surface-variant">إجمالي الركاب</div>
                  <div className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {carrier.totalPassengersCount.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-label-md text-label-md text-on-surface-variant">نسبة الإشغال</div>
                  <div className="font-headline-sm text-headline-sm text-secondary font-bold">
                    {carrier.occupancyRatePercent}%
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Split */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-body-md font-body-md">
                  <span className="text-on-surface-variant">إجمالي مبيعات التذاكر:</span>
                  <span className="font-bold text-on-surface font-tabular-stat">
                    {carrier.totalTicketSalesSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-md font-body-md">
                  <span className="text-on-surface-variant">عمولة منصة ZoolGo المستقطعة (5%):</span>
                  <span className="font-semibold text-primary font-tabular-stat">
                    - {carrier.platformCommissionSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high text-on-surface">
                  <span className="font-headline-sm text-headline-sm font-bold text-secondary">
                    صافي المستحق النهائي للتحويل:
                  </span>
                  <span className="font-tabular-stat text-tabular-stat font-bold text-secondary">
                    {carrier.netPayableSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                  </span>
                </div>
              </div>

              {/* Operational Route & Channels Insights */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">alt_route</span>
                    المسار الأكثر ربحية:
                  </span>
                  <span className="font-bold text-on-surface">{carrier.mostProfitableRoute}</span>
                </div>

                {/* Sales Channel Split */}
                <div className="space-y-1">
                  <div className="flex justify-between font-label-md text-label-md text-on-surface-variant">
                    <span>وكلاء ومكاتب وسطاء ({carrier.brokerSharePercent}%)</span>
                    <span>تطبيق المسافر المباشر ({carrier.directAppSharePercent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container flex overflow-hidden">
                    <div
                      className="h-full bg-secondary"
                      style={{ width: `${carrier.brokerSharePercent}%` }}
                    ></div>
                    <div
                      className="h-full bg-secondary-container"
                      style={{ width: `${carrier.directAppSharePercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default CarrierSharesPage;
