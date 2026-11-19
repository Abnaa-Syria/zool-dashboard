import React from 'react';
import { Link } from 'react-router-dom';
import type { FinancialLedgerEntry } from '../types/financials';

interface LedgerTableProps {
  entries: FinancialLedgerEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  entries,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const formatSdg = (amount: number) => {
    return Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusBadge = (status: FinancialLedgerEntry['status']) => {
    switch (status) {
      case 'reconciled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-md text-[11px] bg-secondary-fixed text-on-secondary-fixed font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            مقيد ومطابق
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-md text-[11px] bg-primary-fixed text-on-primary-fixed font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            قيد التسوية
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-md text-[11px] bg-error-container text-on-error-container font-medium">
            <span className="material-symbols-outlined text-[12px]">warning</span>
            تدقيق استثنائي
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: FinancialLedgerEntry['type'], label: string) => {
    switch (type) {
      case 'ticket_debit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md bg-primary-fixed text-on-primary-fixed font-medium">
            {label}
          </span>
        );
      case 'commission_credit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md bg-secondary-container text-on-secondary-container font-medium">
            {label}
          </span>
        );
      case 'wallet_topup':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md bg-secondary-fixed text-on-secondary-fixed font-medium">
            {label}
          </span>
        );
      case 'refund_reversal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md bg-surface-container-high text-on-surface font-medium">
            {label}
          </span>
        );
      case 'settlement_payout':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md bg-tertiary-fixed text-on-tertiary-fixed font-medium">
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md bg-surface-container text-on-surface">
            {label}
          </span>
        );
    }
  };

  const getTypeIcon = (type: FinancialLedgerEntry['type']) => {
    switch (type) {
      case 'ticket_debit':
        return (
          <span className="material-symbols-outlined text-[18px] text-primary">
            arrow_circle_down
          </span>
        );
      case 'commission_credit':
        return (
          <span className="material-symbols-outlined text-[18px] text-secondary">
            arrow_circle_up
          </span>
        );
      case 'wallet_topup':
        return (
          <span className="material-symbols-outlined text-[18px] text-secondary">
            add_card
          </span>
        );
      case 'refund_reversal':
        return (
          <span className="material-symbols-outlined text-[18px] text-outline">
            published_with_changes
          </span>
        );
      case 'settlement_payout':
        return (
          <span className="material-symbols-outlined text-[18px] text-tertiary">
            payments
          </span>
        );
      default:
        return (
          <span className="material-symbols-outlined text-[18px] text-outline">
            receipt
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-container-high">
      {/* Table Header Info Bar */}
      <div className="px-space-md py-3 bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span className="font-label-lg text-label-lg text-on-surface font-bold">
            حركات اليومية الميدانية والمركزية
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">
            (محدّث لحظياً عبر النظام المحاسبي المركزي)
          </span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-[18px]">lock</span>
          <span className="font-mono text-xs">SHA-256 Ledger Block</span>
        </div>
      </div>

      {/* Dense Data Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-surface-container-high text-on-surface-variant font-label-md text-label-md tracking-wider border-b border-surface-container">
              <th className="py-3 px-4 font-semibold text-right">رقم القيد المحاسبي</th>
              <th className="py-3 px-4 font-semibold text-right">التاريخ والتوقيت</th>
              <th className="py-3 px-4 font-semibold text-right">نوع الحركة والعملية</th>
              <th className="py-3 px-4 font-semibold text-right">الطرف المعني والتفاصيل</th>
              <th className="py-3 px-4 font-semibold text-right">قناة السداد / المرجع</th>
              <th className="py-3 px-4 font-semibold text-left">المبلغ (ج.س)</th>
              <th className="py-3 px-4 font-semibold text-right">الأثر على الرصيد</th>
              <th className="py-3 px-4 font-semibold text-center">حالة القيد والبصمة</th>
              <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-outline">
                      receipt_long
                    </span>
                    <span className="font-label-lg text-label-lg">لا توجد قيود محاسبية مطابقة للبحث</span>
                    <span className="font-body-sm text-body-sm text-outline">
                      جرب تغيير نوع الحركة أو التاريخ أو مسح الفلاتر.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isDebit = entry.amountSdg < 0;
                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-surface-container-low/60 transition-colors"
                  >
                    {/* 1. Transaction Code */}
                    <td className="py-3.5 px-4 font-tabular-stat text-label-lg font-bold text-tertiary">
                      <div className="flex items-center gap-1.5">
                        {getTypeIcon(entry.type)}
                        <Link
                          to={`/financials/ledger/${entry.id}`}
                          className="hover:underline text-tertiary font-mono"
                        >
                          {entry.id}
                        </Link>
                      </div>
                    </td>

                    {/* 2. Date & Time */}
                    <td className="py-3.5 px-4 font-body-sm text-body-sm text-on-surface-variant">
                      <div>{entry.dateStr}</div>
                      <div className="font-tabular-stat text-[11px] text-outline font-mono">
                        {entry.timeStr}
                      </div>
                    </td>

                    {/* 3. Type */}
                    <td className="py-3.5 px-4">
                      {getTypeBadge(entry.type, entry.typeLabel)}
                    </td>

                    {/* 4. Party Details */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {entry.brokerName && (
                        <div className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                          {entry.brokerName}{' '}
                          {entry.brokerId && (
                            <span className="text-secondary font-mono text-xs">
                              ({entry.brokerId})
                            </span>
                          )}
                        </div>
                      )}
                      <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        {entry.partyDescription}
                      </div>
                    </td>

                    {/* 5. Channel / Ref */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-body-sm text-body-sm">
                        {entry.paymentChannelLabel}
                      </span>
                    </td>

                    {/* 6. Amount */}
                    <td
                      className={`py-3.5 px-4 text-left font-tabular-stat text-label-lg font-bold ${
                        isDebit ? 'text-primary' : 'text-secondary'
                      }`}
                      dir="ltr"
                    >
                      {isDebit ? `- ${formatSdg(entry.amountSdg)}` : `+ ${formatSdg(entry.amountSdg)}`}{' '}
                      ج.س
                    </td>

                    {/* 7. Post Balance */}
                    <td className="py-3.5 px-4">
                      <div className="font-tabular-stat text-body-sm font-semibold">
                        {entry.postBalanceSdg.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}{' '}
                        ج.س
                      </div>
                      <span className="font-body-sm text-[11px] text-outline">
                        {isDebit ? 'رصيد متبقٍ' : 'رصيد بعد الحركة'}
                      </span>
                    </td>

                    {/* 8. Status & Hash */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        {getStatusBadge(entry.status)}
                        <span className="font-body-sm text-[10px] text-outline font-mono mt-0.5" title={entry.sha256Hash}>
                          Hash: {entry.sha256Hash.slice(0, 7)}...
                        </span>
                      </div>
                    </td>

                    {/* 9. Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to={`/financials/ledger/${entry.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors whitespace-nowrap shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>عرض القيد المزدوج</span>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-space-md py-3.5 bg-surface-container-low border-t border-surface-container-high flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
          <span>
            عرض{' '}
            <b className="text-on-surface">
              {entries.length === 0 ? 0 : (page - 1) * pageSize + 1}
            </b>{' '}
            إلى{' '}
            <b className="text-on-surface">
              {Math.min(page * pageSize, total)}
            </b>{' '}
            من إجمالي <b className="text-on-surface">{total}</b> قيداً محاسبياً
          </span>
          {onPageSizeChange && (
            <div className="flex items-center gap-1.5 mr-4">
              <span className="text-outline text-xs">عرض في الصفحة:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-0.5 bg-surface-container-lowest rounded border border-surface-container-high text-xs font-medium"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed text-on-surface font-label-md text-label-md transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] rotate-180">chevron_left</span>
            <span>السابق</span>
          </button>

          <div className="flex items-center gap-1 px-2 font-tabular-stat text-sm font-semibold">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  p === page
                    ? 'bg-tertiary text-on-tertiary font-bold'
                    : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed text-on-surface font-label-md text-label-md transition-colors shadow-xs"
          >
            <span>التالي</span>
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
        </div>
      </div>
    </div>
  );
};
