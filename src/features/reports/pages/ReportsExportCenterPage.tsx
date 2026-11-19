import React, { useState } from 'react';
import { useExportCenter } from '../hooks/useReports';
import { ReportExportModal } from '../components/ReportExportModal';
import type { ExportableReportItem } from '../types/reports';

export const ReportsExportCenterPage: React.FC = () => {
  const { catalog, history, triggerExport } = useExportCenter();

  const [selectedReportForModal, setSelectedReportForModal] = useState<ExportableReportItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Quick generation drawer state
  const [quickReportId, setQuickReportId] = useState(catalog[0]?.id || 'rep-daily-cashflow');
  const [quickDateRange, setQuickDateRange] = useState('الربع الرابع Q4 2024');
  const [quickFormat, setQuickFormat] = useState<'PDF' | 'Excel' | 'CSV'>('Excel');
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [includeSha256, setIncludeSha256] = useState(true);

  const periodicReports = catalog.filter((r) => r.category === 'periodic_executive');
  const regulatoryReports = catalog.filter((r) => r.category === 'regulatory_compliance');

  const handleOpenModal = (report: ExportableReportItem) => {
    setSelectedReportForModal(report);
    setIsModalOpen(true);
  };

  const handleConfirmModalExport = (
    reportId: string,
    format: 'PDF' | 'Excel' | 'CSV',
    dateRange: string
  ) => {
    const record = triggerExport(reportId, format, dateRange);
    setSuccessToast(`تم توليد وتصدير ملف "${record.reportTitle}" بنجاح بصيغة ${format}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleQuickExport = () => {
    const record = triggerExport(quickReportId, quickFormat, quickDateRange);
    setSuccessToast(`تم توليد كشف "${record.reportTitle}" وتوثيقه مشفراً بنجاح.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const scrollToHistory = () => {
    const el = document.getElementById('export-history-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full overflow-hidden p-space-lg flex flex-col gap-space-lg max-w-[1520px] mx-auto">
      {/* Subtle Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-secondary-container/30 blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-32 left-10 w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl -z-10 pointer-events-none"></div>

      {/* Breadcrumb Hierarchy */}
      <nav className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
        <a className="hover:text-secondary cursor-pointer transition-colors" href="/reports">
          الرئيسية والعمليات
        </a>
        <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_left</span>
        <a className="hover:text-secondary cursor-pointer transition-colors" href="/reports">
          المالية والتسويات
        </a>
        <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_left</span>
        <a className="hover:text-secondary cursor-pointer transition-colors" href="/reports">
          التقارير المالية والإحصاءات
        </a>
        <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_left</span>
        <span className="text-secondary font-bold">مركز تصدير التقارير والإقرارات</span>
      </nav>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 bg-secondary text-on-secondary rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-label-lg text-sm">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            {successToast}
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-on-secondary/80 hover:text-on-secondary">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header Section with Distinct Split Visual Weight */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
              إصدار المدقق المالي v4.2
            </span>
            <span className="flex items-center gap-1 font-label-md text-label-md text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
              تحديث مباشر للمطابقات 24/7
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            مركز تصدير التقارير وجدولة الإقرارات المالية
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            توليد وتنزيل الكشوفات المحاسبية الرسمية، التقارير الضريبية، وجدولة الإرسال التلقائي لمراقبي الحسابات مع التوقيع المشفر.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={scrollToHistory}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">history</span>
            <span>سجل التصدير وعمليات التحميل</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container-lowest text-secondary font-tabular-stat text-body-sm font-bold">
              1,482
            </span>
          </button>
          <button
            onClick={() => handleOpenModal(catalog[0])}
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-secondary text-on-secondary hover:bg-tertiary transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">more_time</span>
            <span>جدولة تقرير آلي جديد</span>
          </button>
        </div>
      </div>

      {/* Quick Analytical Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-surface-container-high">
          <div>
            <span className="font-label-md text-label-md text-on-surface-variant block mb-1">التقارير الجاهزة للدورة</span>
            <span className="font-display-md text-display-md text-on-surface font-bold">18 كشفاً</span>
            <div className="flex items-center gap-1 text-secondary font-label-md text-label-md mt-1">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>مكتملة المطابقة</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[26px]">account_balance</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-surface-container-high">
          <div>
            <span className="font-label-md text-label-md text-on-surface-variant block mb-1">إجمالي تسوية W-44</span>
            <span className="font-display-md text-display-md text-on-surface font-bold">
              482.9M <span className="font-label-md text-label-md font-normal">SDG</span>
            </span>
            <div className="flex items-center gap-1 text-secondary font-label-md text-label-md mt-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+14.2% مقارنة بـ W-43</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
            <span className="material-symbols-outlined text-[26px]">payments</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-surface-container-high">
          <div>
            <span className="font-label-md text-label-md text-on-surface-variant block mb-1">شهادات التوثيق الرقمي</span>
            <span className="font-display-md text-display-md text-on-surface font-bold">100% SHA-256</span>
            <div className="flex items-center gap-1 text-secondary font-label-md text-label-md mt-1">
              <span className="material-symbols-outlined text-[16px]">lock_clock</span>
              <span>مفتاح تدقيق بنكي آمن</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[26px]">encrypted</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-primary text-on-primary shadow-sm flex items-center justify-between">
          <div>
            <span className="font-label-md text-label-md text-on-primary-container block mb-1">الإرسال الآلي التالي</span>
            <span className="font-display-md text-display-md text-on-primary font-bold">04:30 س</span>
            <div className="flex items-center gap-1 text-on-primary-container font-label-md text-label-md mt-1">
              <span className="material-symbols-outlined text-[16px]">schedule_send</span>
              <span>هيئة الضرائب والمراجع العام</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[26px]">mark_email_read</span>
          </div>
        </div>
      </div>

      {/* Main Content Dual-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Right Section: Catalog of Official Financial Reports (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Catalog Category 1: Periodic & Executive Reports */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[24px]">analytics</span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    التقارير الدورية والإدارية المعتمدة
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    الكشوفات الخاصة بالتدفق اليومي، دورات تسوية الوكالات، ومستحقات أساطيل النقل
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-surface-container-low text-secondary font-label-md text-label-md font-semibold">
                {periodicReports.length} نماذج قياسية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {periodicReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleOpenModal(report)}
                  className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden border border-transparent hover:border-secondary"
                >
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md">
                        {report.updateFrequency}
                      </span>
                      <span className="material-symbols-outlined text-secondary text-[20px]">receipt_long</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {report.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {report.description}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 mt-2 flex items-center justify-between text-on-surface-variant font-label-md text-label-md border-t border-surface-container">
                    <span className="flex items-center gap-1 font-bold text-secondary">
                      <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span> {report.supportedFormats.join(' / ')}
                    </span>
                    <span className="text-secondary group-hover:underline flex items-center gap-0.5">
                      إعداد وتوليد <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog Category 2: Regulatory & Compliance */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[24px]">gavel</span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    الإقرارات الضريبية والمطابقات الرقابية الرسمية
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    كشوفات معتمدة لتقديمها إلى ديوان الضرائب وبنك السودان المركزي لمطابقة عمليات النقل
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-surface-container-low text-primary font-label-md text-label-md font-semibold">
                {regulatoryReports.length} إقرارات رسمية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {regulatoryReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleOpenModal(report)}
                  className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden border border-transparent hover:border-primary"
                >
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-bold">
                        {report.updateFrequency}
                      </span>
                      <span className="material-symbols-outlined text-primary text-[20px]">shield_with_heart</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {report.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {report.description}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 mt-2 flex items-center justify-between text-on-surface-variant font-label-md text-label-md border-t border-surface-container">
                    <span className="flex items-center gap-1 font-bold text-primary">
                      <span className="material-symbols-outlined text-[16px]">verified</span> موثق ومعتمد
                    </span>
                    <span className="text-primary group-hover:underline flex items-center gap-0.5">
                      توليد المستند <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left Section: Quick Generation Box (4 Cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high flex flex-col gap-space-md sticky top-20">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-container-high">
            <div className="w-8 h-8 rounded-lg bg-secondary-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                لوحة التصدير المباشر
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                تخصيص الفلاتر والتنزيل الفوري
              </p>
            </div>
          </div>

          <div className="space-y-space-sm">
            {/* Select Report */}
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                نوع الكشف المحاسبي:
              </label>
              <select
                value={quickReportId}
                onChange={(e) => setQuickReportId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Period */}
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                الفترة المحاسبية:
              </label>
              <select
                value={quickDateRange}
                onChange={(e) => setQuickDateRange(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="الربع الرابع Q4 2024">الربع الرابع Q4 2024 (أكتوبر - ديسمبر)</option>
                <option value="الربع الثالث Q3 2024">الربع الثالث Q3 2024 (يوليو - سبتمبر)</option>
                <option value="أكتوبر 2024 التراكمي">الشهر الحالي: أكتوبر 2024</option>
                <option value="السنة المالية 2024 كاملة">السنة المالية 2024 كاملة</option>
              </select>
            </div>

            {/* Format Selection */}
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                صيغة الملف:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Excel', 'PDF', 'CSV'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setQuickFormat(fmt)}
                    className={`py-2 px-2 rounded-lg border font-label-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      quickFormat === fmt
                        ? 'border-secondary bg-secondary-container text-on-secondary-container shadow-xs'
                        : 'border-surface-container-high bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {fmt === 'PDF' ? 'picture_as_pdf' : fmt === 'Excel' ? 'table_chart' : 'description'}
                    </span>
                    <span>{fmt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="pt-2 space-y-2 border-t border-surface-container-high">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface">
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                  className="rounded text-secondary focus:ring-secondary"
                />
                <span>تضمين العلامة المائية الرسمية لمنصة ZoolGo</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface">
                <input
                  type="checkbox"
                  checked={includeSha256}
                  onChange={(e) => setIncludeSha256(e.target.checked)}
                  className="rounded text-secondary focus:ring-secondary"
                />
                <span>إرفاق ختم التشفير الرقمي SHA-256 للمطابقة البنكية</span>
              </label>
            </div>

            {/* Download Button */}
            <button
              onClick={handleQuickExport}
              type="button"
              className="w-full mt-3 h-11 rounded-lg bg-secondary text-on-secondary hover:bg-tertiary font-label-lg text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>توليد وتنزيل التقرير الآن</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export History Audit Table Section */}
      <div id="export-history-section" className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
        <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">history</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              سجل التصدير وعمليات التحميل السابقة
            </h3>
          </div>
          <span className="font-label-md text-xs text-on-surface-variant font-mono">
            {history.length} عمليات مسجلة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant font-label-md">
                <th className="py-2.5 px-4 font-bold">اسم التقرير</th>
                <th className="py-2.5 px-4 font-bold">تاريخ ووقت التوليد</th>
                <th className="py-2.5 px-3 font-bold text-center">الصيغة</th>
                <th className="py-2.5 px-3 font-bold">حجم الملف</th>
                <th className="py-2.5 px-4 font-bold font-mono">ختم التشفير (SHA-256)</th>
                <th className="py-2.5 px-3 font-bold text-center">الحالة</th>
                <th className="py-2.5 px-4 font-bold text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-sm">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-4 font-bold text-on-surface">
                    {record.reportTitle}
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant font-mono text-[11px]">
                    {record.exportedAt}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-mono font-bold text-[11px]">
                      {record.format}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-on-surface-variant font-mono">
                    {(record.fileSizeBytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant font-mono text-[11px]">
                    {record.sha256Seal}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      مكتمل
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSuccessToast(`تمت إعادة تنزيل كشف "${record.reportTitle}"`);
                        setTimeout(() => setSuccessToast(null), 3000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-surface-container text-secondary hover:bg-surface-container-high font-label-md font-semibold text-[11px] inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      تحميل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal */}
      <ReportExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        report={selectedReportForModal}
        onConfirmExport={handleConfirmModalExport}
      />
    </div>
  );
};

export default ReportsExportCenterPage;
