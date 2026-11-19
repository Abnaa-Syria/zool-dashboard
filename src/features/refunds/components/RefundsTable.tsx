import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { RefundRequest } from '../types/refunds';

interface RefundsTableProps {
  requests: RefundRequest[];
  onOpenOverride: (request: RefundRequest) => void;
}

export const RefundsTable: React.FC<RefundsTableProps> = ({ requests, onOpenOverride }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: RefundRequest['status'], label: string) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-md text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
            {label}
          </span>
        );
      case 'scheduled_settlement':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {label}
          </span>
        );
      case 'approved_refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-bold">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {label}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-md text-xs font-medium">
            <span className="material-symbols-outlined text-[14px]">cancel</span>
            {label}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-md text-xs">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container-high">
      <div className="p-space-md flex items-center justify-between bg-surface-container-low border-b border-surface-container-high">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-secondary">list_alt</span>
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            سجل طلبات الإلغاء والاسترداد المالي المباشر
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-md text-xs font-bold font-mono">
            {requests.length} طلبات
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead className="bg-surface-container font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
            <tr>
              <th className="py-3 px-space-md">رقم التذكرة</th>
              <th className="py-3 px-space-md">اسم المسافر</th>
              <th className="py-3 px-space-md">الشركة الناقلة</th>
              <th className="py-3 px-space-md">المسار والمقعد</th>
              <th className="py-3 px-space-md">المبلغ المطلوب</th>
              <th className="py-3 px-space-md">توقيت الطلب</th>
              <th className="py-3 px-space-md">الحالة التشغيلية</th>
              <th className="py-3 px-space-md text-left">الإجراء المتاح</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high font-body-md text-sm text-on-surface">
            {requests.map((r) => (
              <tr key={r.id} className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-space-md font-tabular-stat font-bold text-primary">
                  {r.ticketNumber}
                </td>
                <td className="py-3.5 px-space-md font-semibold text-on-surface">
                  {r.passengerName}
                </td>
                <td className="py-3.5 px-space-md text-on-surface-variant text-xs">
                  {r.carrierName}
                </td>
                <td className="py-3.5 px-space-md text-xs">
                  {r.routeText} ({r.seatNumber})
                </td>
                <td className="py-3.5 px-space-md font-tabular-stat font-semibold text-on-surface">
                  {r.requestedAmountSdg.toFixed(2)} ج.س
                </td>
                <td className="py-3.5 px-space-md text-on-surface-variant text-xs">
                  {r.requestAgeText}
                </td>
                <td className="py-3.5 px-space-md">
                  {getStatusBadge(r.status, r.statusLabel)}
                </td>
                <td className="py-3.5 px-space-md text-left">
                  <div className="flex items-center justify-end gap-1.5">
                    {r.ticketNumber === 'ZL-902144' || r.status === 'pending_review' ? (
                      <button
                        onClick={() => navigate(`/refunds/disputes/${r.ticketNumber}`)}
                        className="px-3 py-1 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px]">gavel</span>
                        <span>معالجة النزاع</span>
                      </button>
                    ) : null}
                    <button
                      onClick={() => onOpenOverride(r)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface font-label-md text-xs transition-colors flex items-center gap-1"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      <span>استرداد يدوي</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
