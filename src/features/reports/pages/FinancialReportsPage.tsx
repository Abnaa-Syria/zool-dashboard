import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinancialReports, useExportCenter } from '../hooks/useReports';
import { CashFlowChart } from '../components/CashFlowChart';
import { SalesChannelDonutChart } from '../components/SalesChannelDonutChart';
import { ReportExportModal } from '../components/ReportExportModal';
import type { ExportableReportItem } from '../types/reports';

export const FinancialReportsPage: React.FC = () => {
  const {
    metrics,
    filters,
    setQuarter,
    setState,
    setCarrier,
    setChannel,
    refresh,
  } = useFinancialReports();

  const { catalog, triggerExport } = useExportCenter();
  const [selectedReportForExport, setSelectedReportForExport] = useState<ExportableReportItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOpenExport = () => {
    const defaultReport = catalog[0] || null;
    setSelectedReportForExport(defaultReport);
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = (reportId: string, format: 'PDF' | 'Excel' | 'CSV', dateRange: string) => {
    triggerExport(reportId, format, dateRange);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg p-space-lg max-w-[1600px] mx-auto">
      {/* 1. Breadcrumbs & Meta Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-y-2">
        <nav className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
          <Link to="/overview" className="hover:text-secondary transition-colors">
            الرئيسية والعمليات
          </Link>
          <span className="material-symbols-outlined text-[14px] rotate-180">chevron_left</span>
          <Link to="/financials/wallets" className="hover:text-secondary transition-colors">
            المالية والتسويات
          </Link>
          <span className="material-symbols-outlined text-[14px] rotate-180">chevron_left</span>
          <span className="text-secondary font-bold">لوحة المؤشرات والتحليلات المالية</span>
        </nav>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            البيانات متزامنة لحظياً (آخر تحديث منذ دقيقتين)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md font-mono">
            نسخة التدقيق: #AUD-2024-Q4
          </span>
        </div>
      </div>

      {/* 2. Header & Quick Navigation Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">monitoring</span>
            </div>
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                لوحة التحليلات والإحصاءات المالية المتقدمة
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                متابعة التدفقات النقدية المركزية، نسب الاقتطاع، وأداء التحصيل بين شبكات الوكلاء والناقلين
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons & Module Links */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/reports/trial-balance"
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-lg bg-surface-container text-secondary hover:bg-surface-container-high transition-all font-label-lg text-label-lg shadow-sm border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">balance</span>
            <span>ميزان المراجعة والمطابقة</span>
          </Link>

          <Link
            to="/reports/carrier-shares"
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-lg bg-surface-container text-secondary hover:bg-surface-container-high transition-all font-label-lg text-label-lg shadow-sm border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">directions_bus</span>
            <span>حصص الناقلين</span>
          </Link>

          <Link
            to="/reports/export-center"
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-lg bg-surface-container text-secondary hover:bg-surface-container-high transition-all font-label-lg text-label-lg shadow-sm border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_download</span>
            <span>مركز التصدير</span>
          </Link>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 h-10 px-3 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container transition-all font-label-lg text-label-lg shadow-sm"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-transform duration-500 ${
                isRefreshing ? 'rotate-180 text-secondary' : ''
              }`}
            >
              sync
            </span>
            <span>تحديث</span>
          </button>

          <button
            onClick={handleOpenExport}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-all font-label-lg text-label-lg shadow-md"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>تصدير تقرير المؤشرات</span>
          </button>
        </div>
      </div>

      {/* 3. Filters Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm bg-surface-container-low p-space-sm rounded-xl border border-surface-container-high">
        {/* Date Range Selector */}
        <div className="relative bg-surface-container-lowest rounded-lg px-3 py-2 flex items-center justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-secondary text-[20px]">calendar_month</span>
            <div className="min-w-0">
              <div className="font-label-md text-label-md text-on-surface-variant">الفترة المالية</div>
              <select
                value={filters.quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="bg-transparent font-label-lg text-label-lg text-on-surface focus:outline-none cursor-pointer w-full"
              >
                <option value="Q4 2024">Q4 2024 (أكتوبر - ديسمبر)</option>
                <option value="Q3 2024">Q3 2024 (يوليو - سبتمبر)</option>
                <option value="Q2 2024">Q2 2024 (أبريل - يونيو)</option>
                <option value="FY 2024">السنة المالية 2024 كاملة</option>
              </select>
            </div>
          </div>
        </div>

        {/* State Filter */}
        <div className="relative bg-surface-container-lowest rounded-lg px-3 py-2 flex items-center justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">pin_drop</span>
            <div className="min-w-0">
              <div className="font-label-md text-label-md text-on-surface-variant">النطاق الجغرافي</div>
              <select
                value={filters.state}
                onChange={(e) => setState(e.target.value)}
                className="bg-transparent font-label-lg text-label-lg text-on-surface focus:outline-none cursor-pointer w-full"
              >
                <option value="all">كل الولايات (18 ولاية)</option>
                <option value="الخرطوم">ولاية الخرطوم</option>
                <option value="البحر الأحمر">ولاية البحر الأحمر</option>
                <option value="نهر النيل">ولاية نهر النيل</option>
                <option value="الشمالية">الولاية الشمالية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Carrier Filter */}
        <div className="relative bg-surface-container-lowest rounded-lg px-3 py-2 flex items-center justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">directions_bus</span>
            <div className="min-w-0">
              <div className="font-label-md text-label-md text-on-surface-variant">الناقلون المعتمدون</div>
              <select
                value={filters.carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="bg-transparent font-label-lg text-label-lg text-on-surface focus:outline-none cursor-pointer w-full"
              >
                <option value="all">كافة الناقلين (34 شركة)</option>
                <option value="SAP-8802">شركة سابتكو للنقل الجماعي</option>
                <option value="NIL-4410">شركة النيل للنقل البري</option>
                <option value="EDL-2019">شركة إيست دلتا</option>
                <option value="SRY-9140">شركة شريان الشمال</option>
              </select>
            </div>
          </div>
        </div>

        {/* Channel Filter */}
        <div className="relative bg-surface-container-lowest rounded-lg px-3 py-2 flex items-center justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">hub</span>
            <div className="min-w-0">
              <div className="font-label-md text-label-md text-on-surface-variant">قناة التحصيل</div>
              <select
                value={filters.channel}
                onChange={(e) => setChannel(e.target.value)}
                className="bg-transparent font-label-lg text-label-lg text-on-surface focus:outline-none cursor-pointer w-full"
              >
                <option value="all">جميع قنوات البيع</option>
                <option value="b2b">مكاتب الوكلاء المعتمدة (B2B)</option>
                <option value="b2c">تطبيق المسافر المباشر (B2C)</option>
                <option value="pos">بوابات المحطات الميدانية (POS)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* KPI 1: GMV */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-high transition-transform hover:-translate-y-0.5">
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-secondary-container/40 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-lg text-label-lg text-on-surface-variant">
              إجمالي حجم التداول المالي (GMV)
            </span>
            <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-tabular-stat text-display-md text-on-surface font-bold tracking-tight">
              {metrics.gmvTotalSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">ج.س</span>
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between bg-surface-container-low/60 -mx-space-md -mb-space-md px-space-md py-2.5 border-t border-surface-container">
            <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary font-bold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +{metrics.gmvGrowthPercent}%
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                مقارنة بـ Q3
              </span>
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {metrics.totalTicketsIssued.toLocaleString()} تذكرة مصدرة
            </span>
          </div>
        </div>

        {/* KPI 2: Take Rate */}
        <div className="relative overflow-hidden rounded-xl bg-secondary text-on-secondary p-space-md shadow-md transition-transform hover:-translate-y-0.5">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-secondary-container/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-lg text-label-lg text-secondary-fixed">
              صافي إيرادات ZoolGo (Take Rate)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
              {metrics.takeRatePercent.toFixed(1)}% اقتطاع
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-tabular-stat text-display-md text-on-secondary font-bold tracking-tight">
              {metrics.takeRateNetSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="font-label-md text-label-md text-secondary-fixed">ج.س</span>
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between bg-black/15 -mx-space-md -mb-space-md px-space-md py-2.5">
            <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary-fixed font-bold">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              +{metrics.takeRateGrowthPercent}% نمو الإيراد
            </span>
            <span className="font-body-sm text-body-sm text-surface-container-high">
              هامش تشغيلي نقي
            </span>
          </div>
        </div>

        {/* KPI 3: Average Ticket Size */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-high transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-label-lg text-label-lg text-on-surface-variant">
              متوسط قيمة التذكرة والسلة
            </span>
            <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-tabular-stat text-display-md text-on-surface font-bold tracking-tight">
              {metrics.avgTicketSizeSdg.toFixed(2)}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">ج.س / حجز</span>
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between bg-surface-container-low/60 -mx-space-md -mb-space-md px-space-md py-2.5 text-on-surface-variant font-label-md text-label-md border-t border-surface-container">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              VIP: <strong className="text-on-surface">{metrics.avgVipTicketSdg} ج.س</strong>
            </div>
            <span className="text-surface-variant">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              عادية: <strong className="text-on-surface">{metrics.avgStandardTicketSdg} ج.س</strong>
            </div>
          </div>
        </div>

        {/* KPI 4: Settlement Rate */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-high transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-label-lg text-label-lg text-on-surface-variant">
              نسبة التسويات المنفذة بموعدها
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
              امتثال مالي ممتاز
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-tabular-stat text-display-md text-secondary font-bold tracking-tight">
              {metrics.settlementPunctualityPercent}%
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">من إجمالي المستحقات</span>
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between bg-surface-container-low/60 -mx-space-md -mb-space-md px-space-md py-2.5 border-t border-surface-container">
            <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              دورة تحويل T+1
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              0 نزاعات مصرفية معلقة
            </span>
          </div>
        </div>
      </div>

      {/* 5. Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Right Section (8 Cols): Cash Flow Chart & Route Corridors */}
        <div className="lg:col-span-8 space-y-space-lg">
          {/* Recharts Cash Flow Interactive Chart */}
          <CashFlowChart data={metrics.cashFlowWeeks} />

          {/* Sales by Geographic Route Corridor */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">route</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    المبيعات بحسب الممرات والمسارات الإقليمية
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  توزيع حركة المسافرين والقيمة الإجمالية للتذاكر المصدرة حسب الممرات الرئيسية
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {metrics.routeCorridors.map((corridor) => (
                <div
                  key={corridor.id}
                  className="p-space-md rounded-lg bg-surface-container-low/70 hover:bg-surface-container-low transition-colors border border-surface-container-high/60"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-md text-label-md font-bold">
                        {corridor.rank}
                      </span>
                      <div>
                        <span className="font-label-lg text-label-lg text-on-surface font-bold">
                          {corridor.routeTitle}
                        </span>
                        <span className="text-on-surface-variant text-body-sm font-body-sm block sm:inline sm:mr-2">
                          {corridor.routeDescription}
                        </span>
                      </div>
                    </div>
                    <div className="text-left font-tabular-stat">
                      <span className="text-headline-sm text-on-surface font-bold">
                        {corridor.totalVolumeSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
                      </span>
                      <span className="text-on-surface-variant font-body-sm text-body-sm block font-normal">
                        ({corridor.passengerCount.toLocaleString()} راكب • {corridor.marketSharePercent}%)
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full transition-all duration-1000"
                      style={{ width: `${corridor.marketSharePercent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left Section (4 Cols): Donut Channel, Gateways, Compliance */}
        <div className="lg:col-span-4 space-y-space-lg">
          {/* Recharts Donut Sales Channel */}
          <SalesChannelDonutChart channels={metrics.salesChannels} />

          {/* Top Payment Gateways */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  بوابات الدفع الإلكتروني
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  نسب التحصيل ومعدل نجاح العمليات
                </p>
              </div>
              <span className="material-symbols-outlined text-secondary text-[20px]">
                account_balance
              </span>
            </div>

            <div className="space-y-4">
              {metrics.paymentGateways.map((gw) => (
                <div key={gw.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">
                        {gw.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-md text-xs">
                        {gw.reliabilityRate}
                      </span>
                    </div>
                    <span className="font-tabular-stat text-label-lg text-on-surface font-bold">
                      {gw.sharePercent}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        gw.type === 'sadad' ? 'bg-primary' : 'bg-secondary'
                      }`}
                      style={{ width: `${gw.sharePercent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Central Bank Compliance Badge */}
          <div className="bg-gradient-to-br from-secondary to-tertiary text-on-secondary rounded-xl p-space-md shadow-md flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px] text-secondary-fixed">
                policy
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-label-lg text-label-lg font-bold text-on-secondary">
                  الامتثال والمعايير المصرفية
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
              </div>
              <p className="font-body-sm text-body-sm text-surface-container-high leading-snug">
                معتمد ومطابق للمعايير الرقابية لبنك السودان المركزي لمقاصة المدفوعات ونظام ISO 27001 Financial Standard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Export Configuration Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={selectedReportForExport}
        onConfirmExport={handleConfirmExport}
      />
    </div>
  );
};
