import React, { useState } from 'react';
import type { ExportableReportItem } from '../types/reports';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ExportableReportItem | null;
  onConfirmExport: (reportId: string, format: 'PDF' | 'Excel' | 'CSV', dateRange: string) => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  report,
  onConfirmExport,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'Excel' | 'CSV'>('Excel');
  const [selectedDateRange, setSelectedDateRange] = useState('الربع الرابع Q4 2024');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !report) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      onConfirmExport(report.id, selectedFormat, selectedDateRange);
      setIsExporting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xl max-w-lg w-full border border-surface-container-high flex flex-col gap-space-md animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-surface-container-high">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">download</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                تصدير وإعداد التقرير المحاسبي
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                {report.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Report Overview Box */}
        <div className="p-3 bg-surface-container-low rounded-lg space-y-1 text-xs">
          <div className="flex justify-between text-on-surface">
            <span className="font-bold">التصنيف:</span>
            <span>
              {report.category === 'periodic_executive' ? 'تقرير دوري إداري' : 'إقرار رقابي رسمي'}
            </span>
          </div>
          <div className="flex justify-between text-on-surface">
            <span className="font-bold">دورية التحديث:</span>
            <span className="text-secondary font-semibold">{report.updateFrequency}</span>
          </div>
          <p className="text-on-surface-variant pt-1 border-t border-surface-container">
            {report.description}
          </p>
        </div>

        {/* Format Selection */}
        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-semibold">
            صيغة الملف المطلوبة:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Excel', 'PDF', 'CSV'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSelectedFormat(fmt)}
                className={`py-2 px-3 rounded-lg border font-label-md text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedFormat === fmt
                    ? 'border-secondary bg-secondary-container text-on-secondary-container shadow-xs'
                    : 'border-surface-container-high bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {fmt === 'PDF' ? 'picture_as_pdf' : fmt === 'Excel' ? 'table_chart' : 'description'}
                </span>
                <span>{fmt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface font-semibold">
            نطاق البيانات الزمني:
          </label>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-secondary/30"
          >
            <option>الربع الرابع Q4 2024 (أكتوبر - ديسمبر)</option>
            <option>الربع الثالث Q3 2024</option>
            <option>السنة المالية 2024 كاملة</option>
            <option>الشهر الحالي (أكتوبر 2024)</option>
          </select>
        </div>

        {/* Security / Cryptographic Seal Notice */}
        <div className="p-2.5 bg-secondary-fixed/30 rounded-lg text-secondary text-xs flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-[18px]">lock</span>
          <span>
            سيتم تضمين الختم الرقمي المشفر (SHA-256) ورقم الترخيص المصرفي الموحد داخل التقرير.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 font-label-md font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isExporting ? 'sync' : 'download'}
            </span>
            <span>{isExporting ? 'جارٍ التوليد...' : 'تنزيل التقرير الآن'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
